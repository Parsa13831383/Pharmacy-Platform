import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import type { UpdateCustomerNotesInput } from './customers.validation'

// ─── Segmentation ─────────────────────────────────────────────────────────────

export type CustomerSegment = 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE'

export function computeSegment(c: {
  totalOrders: number
  totalSpent: number | { toString(): string }
  firstOrderAt: Date
  lastOrderAt: Date
}): CustomerSegment {
  const now = new Date()
  const spent = Number(c.totalSpent)
  const daysSinceLast = (now.getTime() - new Date(c.lastOrderAt).getTime()) / 86_400_000
  const daysSinceFirst = (now.getTime() - new Date(c.firstOrderAt).getTime()) / 86_400_000

  if (c.totalOrders > 5 || spent > 5_000_000) return 'VIP'
  if (daysSinceLast >= 90) return 'INACTIVE'
  if (daysSinceFirst <= 30) return 'NEW'
  return 'REGULAR'
}

// ─── Upsert from order (called by checkout service) ──────────────────────────

export async function upsertCustomerFromOrder(opts: {
  phone: string
  name: string
  amount: number
  orderedAt: Date
}): Promise<void> {
  const existing = await prisma.customer.findUnique({ where: { phone: opts.phone } })

  if (existing) {
    await prisma.customer.update({
      where: { phone: opts.phone },
      data: {
        name: opts.name,
        lastOrderAt: opts.orderedAt,
        totalOrders: { increment: 1 },
        totalSpent: { increment: opts.amount },
      },
    })
  } else {
    await prisma.customer.create({
      data: {
        phone: opts.phone,
        name: opts.name,
        firstOrderAt: opts.orderedAt,
        lastOrderAt: opts.orderedAt,
        totalOrders: 1,
        totalSpent: opts.amount,
      },
    })
  }
}

// ─── List customers ───────────────────────────────────────────────────────────

export async function getCustomers(params: {
  search?: string | undefined
  sortBy?: string | undefined
  sortOrder?: string | undefined
  page?: number | undefined
  pageSize?: number | undefined
}) {
  const {
    search,
    sortBy = 'lastOrderAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = params

  const allowedSorts = ['totalSpent', 'lastOrderAt', 'totalOrders', 'createdAt']
  const orderField = allowedSorts.includes(sortBy) ? sortBy : 'lastOrderAt'
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { [orderField]: orderDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ])

  return {
    customers: customers.map((c) => ({
      ...c,
      totalSpent: Number(c.totalSpent),
      segment: computeSegment(c),
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

  const orders = await prisma.order.findMany({
    where: { customerPhone: customer.phone },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Aggregate product and category preferences
  const productMap = new Map<string, { name: string; count: number; totalSpent: number }>()
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>()

  for (const order of orders) {
    for (const item of order.items) {
      const prev = productMap.get(item.productId) ?? { name: item.productNameSnapshot, count: 0, totalSpent: 0 }
      productMap.set(item.productId, {
        name: prev.name,
        count: prev.count + item.quantity,
        totalSpent: prev.totalSpent + Number(item.totalPrice),
      })

      const cat = item.product?.category
      if (cat) {
        const prevCat = categoryMap.get(cat.id) ?? { name: cat.name, slug: cat.slug, count: 0 }
        categoryMap.set(cat.id, { name: prevCat.name, slug: prevCat.slug, count: prevCat.count + item.quantity })
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

  return {
    customer: { ...customer, totalSpent: Number(customer.totalSpent), segment: computeSegment(customer) },
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        productId: i.productId,
        productName: i.productNameSnapshot,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    })),
    topProducts,
    topCategories,
  }
}

// ─── Update notes ─────────────────────────────────────────────────────────────

export async function updateCustomerNotes(id: string, input: UpdateCustomerNotesInput) {
  const exists = await prisma.customer.findUnique({ where: { id } })
  if (!exists) throw new AppError('مشتری یافت نشد', 404)

  return prisma.customer.update({ where: { id }, data: { notes: input.notes } })
}

// ─── Analytics stats ──────────────────────────────────────────────────────────

export async function getCustomerStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000)

  const [totalCustomers, newThisMonth, all] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { firstOrderAt: { gte: thirtyDaysAgo } } }),
    prisma.customer.findMany({
      select: { totalOrders: true, totalSpent: true, firstOrderAt: true, lastOrderAt: true },
    }),
  ])

  let vipCount = 0
  let inactiveCount = 0
  let returningCount = 0

  for (const c of all) {
    const seg = computeSegment(c)
    if (seg === 'VIP') vipCount++
    if (seg === 'INACTIVE') inactiveCount++
    if (c.totalOrders > 1) returningCount++
  }

  return {
    totalCustomers,
    newThisMonth,
    vipCustomers: vipCount,
    inactiveCustomers: inactiveCount,
    returningRate: totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 0,
  }
}
