import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import { normalizePhone } from '../../lib/phone'
import type { UpdateCustomerNotesInput } from './customers.validation'

// ─── Segmentation ─────────────────────────────────────────────────────────────

export type CustomerSegment = 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE'

export function computeSegment(c: {
  totalOrders: number
  totalSpent: number | { toString(): string }
  firstOrderAt: Date | string | null | undefined
  lastOrderAt:  Date | string | null | undefined
}): CustomerSegment {
  const now    = new Date()
  const spent  = Number(c.totalSpent)

  // Guard against NULL dates in old DB rows that pre-date the non-null constraint
  const lastDate  = c.lastOrderAt  ? new Date(c.lastOrderAt)  : now
  const firstDate = c.firstOrderAt ? new Date(c.firstOrderAt) : now
  const lastMs    = isNaN(lastDate.getTime())  ? now.getTime() : lastDate.getTime()
  const firstMs   = isNaN(firstDate.getTime()) ? now.getTime() : firstDate.getTime()

  const daysSinceLast  = (now.getTime() - lastMs)  / 86_400_000
  const daysSinceFirst = (now.getTime() - firstMs) / 86_400_000

  if (c.totalOrders > 5 || spent > 5_000_000) return 'VIP'
  if (daysSinceLast >= 90) return 'INACTIVE'
  if (daysSinceFirst <= 30) return 'NEW'
  return 'REGULAR'
}

// ─── Upsert from order ────────────────────────────────────────────────────────
// Called by checkout.service after a successful order is placed.
// Uses prisma.upsert for atomicity — no race condition.

export async function upsertCustomerFromOrder(opts: {
  phone:     string
  name:      string
  amount:    number
  orderedAt: Date
}): Promise<void> {
  await prisma.customer.upsert({
    where:  { phone: opts.phone },
    update: {
      name:        opts.name,
      lastOrderAt: opts.orderedAt,
      totalOrders: { increment: 1 },
      totalSpent:  { increment: opts.amount },
    },
    create: {
      phone:        opts.phone,
      name:         opts.name,
      firstOrderAt: opts.orderedAt,
      lastOrderAt:  opts.orderedAt,
      totalOrders:  1,
      totalSpent:   opts.amount,
    },
  })
}

// ─── Phone search helper ──────────────────────────────────────────────────────
// Tries to normalize a search term as a phone number.
// Returns the E.164 form if valid, undefined otherwise.

function tryNormalizePhone(raw: string): string | undefined {
  const stripped = raw.replace(/[\s\-().]+/g, '')
  // Looks like a phone attempt if it starts with 0, +, or 00
  if (!/^(\+|00|0)/.test(stripped) && /^\d{10,13}$/.test(stripped) === false) return undefined
  try {
    return normalizePhone(stripped)
  } catch {
    return undefined
  }
}

// ─── List customers ───────────────────────────────────────────────────────────

export async function getCustomers(params: {
  search?:    string | undefined
  sortBy?:    string | undefined
  sortOrder?: string | undefined
  page?:      number | undefined
  pageSize?:  number | undefined
}) {
  const {
    search,
    sortBy    = 'lastOrderAt',
    sortOrder = 'desc',
    page      = 1,
    pageSize  = 20,
  } = params

  const allowedSorts = ['totalSpent', 'lastOrderAt', 'totalOrders', 'createdAt']
  const orderField   = allowedSorts.includes(sortBy) ? sortBy : 'lastOrderAt'
  const orderDir     = sortOrder === 'asc' ? 'asc' : 'desc'

  let where = {}
  if (search && search.trim()) {
    const q = search.trim()
    const normalizedPhone = tryNormalizePhone(q)

    where = {
      OR: [
        // Name fuzzy match (always)
        { name:  { contains: q, mode: 'insensitive' as const } },
        // Exact normalized phone match (when input looks like a phone)
        ...(normalizedPhone ? [{ phone: { equals: normalizedPhone } }] : []),
        // Partial phone string match as fallback (handles digits-only partial input)
        { phone: { contains: q } },
      ],
    }
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { [orderField]: orderDir },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.customer.count({ where }),
  ])

  return {
    customers: customers.map((c) => ({
      ...c,
      totalSpent: Number(c.totalSpent),
      segment:    computeSegment(c),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

// ─── Customer profile ─────────────────────────────────────────────────────────

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } })
  if (!customer) throw new AppError('مشتری یافت نشد', 404)

  // Fetch orders with items; also pull category info for preference aggregation.
  // product is non-nullable in schema but guard with ?. in case of data inconsistency.
  const orders = await prisma.order.findMany({
    where:   { customerPhone: customer.phone },
    include: {
      items: {
        include: {
          product: {
            select: {
              id:       true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Aggregate product and category preferences from all orders
  const productMap  = new Map<string, { name: string; count: number; totalSpent: number }>()
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>()

  for (const order of orders) {
    for (const item of order.items) {
      const prevP = productMap.get(item.productId) ?? { name: item.productNameSnapshot, count: 0, totalSpent: 0 }
      productMap.set(item.productId, {
        name:       prevP.name,
        count:      prevP.count + item.quantity,
        totalSpent: prevP.totalSpent + Number(item.totalPrice),
      })

      // item.product can theoretically be null if product was hard-deleted
      const cat = item.product?.category ?? null
      if (cat?.id) {
        const prevC = categoryMap.get(cat.id) ?? { name: cat.name, slug: cat.slug, count: 0 }
        categoryMap.set(cat.id, { name: prevC.name, slug: prevC.slug, count: prevC.count + item.quantity })
      }
    }
  }

  const topProducts = Array.from(productMap.entries())
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topCategories = Array.from(categoryMap.entries())
    .map(([categoryId, v]) => ({ categoryId, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Recent product events — the CustomerEvent table may not exist yet if the
  // migration hasn't been deployed. Degrade gracefully to an empty list.
  let recentEvents: Array<{ id: string; eventType: string; productId: string; productName: string; createdAt: Date }> = []
  try {
    const rawEvents = await prisma.customerEvent.findMany({
      where:   { phone: customer.phone },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take:    30,
    })
    recentEvents = rawEvents
      .filter((e) => e.product != null)
      .map((e) => ({
        id:          e.id,
        eventType:   e.eventType,
        productId:   e.productId,
        productName: e.product!.name,
        createdAt:   e.createdAt,
      }))
  } catch (evtErr) {
    console.warn('[customers] recentEvents query failed (table may not exist yet):', (evtErr as Error).message)
  }

  return {
    customer: {
      id:             customer.id,
      phone:          customer.phone,
      name:           customer.name,
      firstOrderAt:   customer.firstOrderAt,
      lastOrderAt:    customer.lastOrderAt,
      totalOrders:    customer.totalOrders,
      totalSpent:     Number(customer.totalSpent),
      notes:          customer.notes ?? null,
      marketingOptIn: customer.marketingOptIn,
      createdAt:      customer.createdAt,
      updatedAt:      customer.updatedAt,
      segment:        computeSegment(customer),
    },
    orders: orders.map((o) => ({
      id:            o.id,
      orderNumber:   o.orderNumber,
      orderStatus:   o.orderStatus,
      paymentStatus: o.paymentStatus,
      totalAmount:   Number(o.totalAmount),
      createdAt:     o.createdAt,
      items: o.items.map((i) => ({
        productId:   i.productId,
        productName: i.productNameSnapshot,
        quantity:    i.quantity,
        unitPrice:   Number(i.unitPrice),
        totalPrice:  Number(i.totalPrice),
      })),
    })),
    topProducts,
    topCategories,
    recentEvents,
  }
}

// ─── Update notes ─────────────────────────────────────────────────────────────

export async function updateCustomerNotes(id: string, input: UpdateCustomerNotesInput) {
  const exists = await prisma.customer.findUnique({ where: { id } })
  if (!exists) throw new AppError('مشتری یافت نشد', 404)
  return prisma.customer.update({ where: { id }, data: { notes: input.notes } })
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export async function getCustomerStats() {
  const now          = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000)

  const [totalCustomers, newThisMonth, all] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { firstOrderAt: { gte: thirtyDaysAgo } } }),
    prisma.customer.findMany({
      select: { totalOrders: true, totalSpent: true, firstOrderAt: true, lastOrderAt: true },
    }),
  ])

  let vipCount = 0, inactiveCount = 0, returningCount = 0
  for (const c of all) {
    const seg = computeSegment(c)
    if (seg === 'VIP')      vipCount++
    if (seg === 'INACTIVE') inactiveCount++
    if (c.totalOrders > 1)  returningCount++
  }

  return {
    totalCustomers,
    newThisMonth,
    vipCustomers:     vipCount,
    inactiveCustomers: inactiveCount,
    returningRate:    totalCustomers > 0
      ? Math.round((returningCount / totalCustomers) * 100)
      : 0,
  }
}

// ─── Backfill ─────────────────────────────────────────────────────────────────
// Generates/reconciles Customer records from every Order in the database.
// Safe to run repeatedly — uses upsert and recalculates aggregates from scratch
// so totals are always accurate even if previous upserts were partial.

export async function backfillCustomersFromOrders(): Promise<{ processed: number; orderCount: number }> {
  const orders = await prisma.order.findMany({
    select: {
      customerPhone: true,
      customerName:  true,
      totalAmount:   true,
      createdAt:     true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Aggregate per phone — use most recent name, compute totals from scratch
  type Agg = {
    name:         string
    totalOrders:  number
    totalSpent:   number
    firstOrderAt: Date
    lastOrderAt:  Date
  }
  const map = new Map<string, Agg>()

  for (const o of orders) {
    const phone = o.customerPhone
    const prev  = map.get(phone)
    if (prev) {
      prev.totalOrders++
      prev.totalSpent += Number(o.totalAmount)
      if (o.createdAt < prev.firstOrderAt) prev.firstOrderAt = o.createdAt
      if (o.createdAt > prev.lastOrderAt)  prev.lastOrderAt  = o.createdAt
      prev.name = o.customerName  // keep the most-recent name
    } else {
      map.set(phone, {
        name:         o.customerName,
        totalOrders:  1,
        totalSpent:   Number(o.totalAmount),
        firstOrderAt: o.createdAt,
        lastOrderAt:  o.createdAt,
      })
    }
  }

  for (const [phone, agg] of map) {
    await prisma.customer.upsert({
      where:  { phone },
      update: {
        name:         agg.name,
        totalOrders:  agg.totalOrders,
        totalSpent:   agg.totalSpent,
        firstOrderAt: agg.firstOrderAt,
        lastOrderAt:  agg.lastOrderAt,
      },
      create: {
        phone,
        name:         agg.name,
        totalOrders:  agg.totalOrders,
        totalSpent:   agg.totalSpent,
        firstOrderAt: agg.firstOrderAt,
        lastOrderAt:  agg.lastOrderAt,
      },
    })
  }

  return { processed: map.size, orderCount: orders.length }
}

// ─── Track product event ───────────────────────────────────────────────────────

export async function trackProductEvent(opts: {
  productId: string
  eventType: 'PRODUCT_VIEW' | 'PRODUCT_CLICK'
  sessionId?: string
  phone?:     string
}): Promise<void> {
  // Normalize phone if provided
  let phone: string | undefined
  if (opts.phone) {
    try { phone = normalizePhone(opts.phone) } catch { /* ignore invalid */ }
  }

  await prisma.customerEvent.create({
    data: {
      productId: opts.productId,
      eventType: opts.eventType,
      sessionId: opts.sessionId ?? null,
      phone:     phone ?? null,
    },
  })
}

// ─── Link session events to phone ─────────────────────────────────────────────
// Called after OTP verification so anonymous session events become attributed.

export async function linkSessionEventsToPhone(sessionId: string, phone: string): Promise<void> {
  let normalized: string
  try { normalized = normalizePhone(phone) } catch { return }

  await prisma.customerEvent.updateMany({
    where:  { sessionId, phone: null },
    data:   { phone: normalized },
  })
}
