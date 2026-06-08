import prisma from '../../lib/prisma'
import { computeSegment } from '../customers/customers.service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sinceDate(days: number): Date | undefined {
  if (days === 0) return undefined
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export async function getInsightsOverview(days: number) {
  const since = sinceDate(days)
  const dateFilter = since ? { gte: since } : undefined

  const [
    totalRevenueAgg,
    periodRevenueAgg,
    periodOrdersTotal,
    periodDelivered,
    periodPending,
    periodCancelled,
    allPending,
    allDelivered,
    allCancelled,
    customerStats,
  ] = await Promise.all([
    // All-time delivered revenue
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderStatus: 'DELIVERED' },
    }),
    // Period delivered revenue
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        orderStatus: 'DELIVERED',
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
    // Period total orders
    prisma.order.count({
      where: dateFilter ? { createdAt: dateFilter } : {},
    }),
    // Period delivered count
    prisma.order.count({
      where: {
        orderStatus: 'DELIVERED',
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
    // Period pending count
    prisma.order.count({
      where: {
        orderStatus: 'PENDING',
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
    // Period cancelled count
    prisma.order.count({
      where: {
        orderStatus: 'CANCELLED',
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
    // All-time pending
    prisma.order.count({ where: { orderStatus: 'PENDING' } }),
    // All-time delivered
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    // All-time cancelled
    prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
    // Customer stats
    prisma.customer.findMany({
      select: { totalOrders: true, totalSpent: true, firstOrderAt: true, lastOrderAt: true },
    }),
  ])

  const periodRevenue = Number(periodRevenueAgg._sum.totalAmount ?? 0)
  const avgOrderValue = periodDelivered > 0 ? periodRevenue / periodDelivered : 0

  const totalCustomers = customerStats.length
  const returningCount = customerStats.filter(c => c.totalOrders > 1).length
  const returningRate = totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 0

  return {
    totalRevenue: Number(totalRevenueAgg._sum.totalAmount ?? 0),
    periodRevenue,
    periodOrders: periodOrdersTotal,
    periodDelivered,
    periodPending,
    periodCancelled,
    avgOrderValue,
    returningRate,
    allPending,
    allDelivered,
    allCancelled,
  }
}

// ─── Revenue Trend ────────────────────────────────────────────────────────────

export async function getRevenueTrend(days: number) {
  const since = sinceDate(days === 0 ? 90 : days)

  const orders = await prisma.order.findMany({
    where: {
      orderStatus: 'DELIVERED',
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: 'asc' },
  })

  const byDate = new Map<string, number>()
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    byDate.set(key, (byDate.get(key) ?? 0) + Number(o.totalAmount))
  }

  // Fill all days in range with 0
  const result: { date: string; revenue: number }[] = []
  const effectiveDays = days === 0 ? 90 : days
  for (let i = effectiveDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, revenue: byDate.get(key) ?? 0 })
  }

  return result
}

// ─── Product Intelligence ──────────────────────────────────────────────────────

export async function getProductInsights(days: number) {
  const since = sinceDate(days)

  // Best sellers — from DELIVERED order items only
  const deliveredOrderIds = await prisma.order.findMany({
    where: {
      orderStatus: 'DELIVERED',
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: { id: true },
  })
  const idList = deliveredOrderIds.map(o => o.id)

  const topRows = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: idList.length > 0 ? { orderId: { in: idList } } : { orderId: { in: [] } },
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  // Enrich with product info
  const productIds = topRows.map(r => r.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      stockQuantity: true,
      lowStockThreshold: true,
      images: {
        where: { isPrimary: true },
        select: { imageUrl: true },
        take: 1,
      },
    },
  })
  const productMap = new Map(products.map(p => [p.id, p]))

  const bestSellers = topRows.map(row => {
    const p = productMap.get(row.productId)
    return {
      productId: row.productId,
      name: p?.name ?? '—',
      imageUrl: p?.images[0]?.imageUrl ?? null,
      quantitySold: row._sum.quantity ?? 0,
      revenue: Number(row._sum.totalPrice ?? 0),
      currentStock: p?.stockQuantity ?? 0,
      lowStock: (p?.stockQuantity ?? 0) <= (p?.lowStockThreshold ?? 5),
    }
  })

  // All-time sales per product (for slow-moving detection)
  const allSalesRows = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
  })
  const salesByProduct = new Map(allSalesRows.map(r => [r.productId, r._sum.quantity ?? 0]))

  // Slow-moving: active, stock > 0, sold less than 5 units ever
  const slowMoving = await prisma.product.findMany({
    where: {
      isActive: true,
      stockQuantity: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      stockQuantity: true,
      images: {
        where: { isPrimary: true },
        select: { imageUrl: true },
        take: 1,
      },
    },
    orderBy: { stockQuantity: 'desc' },
  })

  const slowMovingFiltered = slowMoving
    .map(p => ({ ...p, totalSold: salesByProduct.get(p.id) ?? 0, imageUrl: p.images[0]?.imageUrl ?? null }))
    .filter(p => p.totalSold < 5)
    .sort((a, b) => a.totalSold - b.totalSold)
    .slice(0, 10)

  // High demand + low stock: well-selling products with stock <= threshold
  const highDemandLowStock = bestSellers
    .filter(p => p.lowStock && p.currentStock >= 0)
    .slice(0, 10)

  return { bestSellers, slowMoving: slowMovingFiltered, highDemandLowStock }
}

// ─── Category Performance ─────────────────────────────────────────────────────

export async function getCategoryInsights(days: number) {
  const since = sinceDate(days)

  const deliveredOrders = await prisma.order.findMany({
    where: {
      orderStatus: 'DELIVERED',
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: {
      id: true,
      items: {
        select: {
          totalPrice: true,
          quantity: true,
          product: {
            select: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  })

  const categoryMap = new Map<string, { name: string; slug: string; revenue: number; orders: number; quantity: number }>()

  for (const order of deliveredOrders) {
    const seenCats = new Set<string>()
    for (const item of order.items) {
      const cat = item.product?.category
      if (!cat) continue
      const prev = categoryMap.get(cat.id) ?? { name: cat.name, slug: cat.slug, revenue: 0, orders: 0, quantity: 0 }
      categoryMap.set(cat.id, {
        ...prev,
        revenue: prev.revenue + Number(item.totalPrice),
        quantity: prev.quantity + item.quantity,
        orders: prev.orders + (seenCats.has(cat.id) ? 0 : 1),
      })
      seenCats.add(cat.id)
    }
  }

  return Array.from(categoryMap.entries())
    .map(([id, v]) => ({ categoryId: id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
}

// ─── Customer Insights ────────────────────────────────────────────────────────

export async function getCustomerInsights(days: number) {
  const since = sinceDate(days)

  const [all, newPeriod, topBySpend] = await Promise.all([
    prisma.customer.findMany({
      select: { totalOrders: true, totalSpent: true, firstOrderAt: true, lastOrderAt: true },
    }),
    since
      ? prisma.customer.count({ where: { firstOrderAt: { gte: since } } })
      : prisma.customer.count(),
    prisma.customer.findMany({
      orderBy: { totalSpent: 'desc' },
      take: 10,
      select: { id: true, name: true, phone: true, totalOrders: true, totalSpent: true, lastOrderAt: true, firstOrderAt: true },
    }),
  ])

  let vip = 0, inactive = 0, returning = 0
  for (const c of all) {
    const seg = computeSegment(c)
    if (seg === 'VIP') vip++
    if (seg === 'INACTIVE') inactive++
    if (c.totalOrders > 1) returning++
  }

  return {
    total: all.length,
    newThisPeriod: newPeriod,
    returning,
    vip,
    inactive,
    top10: topBySpend.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      totalOrders: c.totalOrders,
      totalSpent: Number(c.totalSpent),
      segment: computeSegment(c),
      lastOrderAt: c.lastOrderAt,
    })),
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function getInsightsRecommendations() {
  const recs: { type: 'warning' | 'success' | 'info'; title: string; body: string }[] = []

  // 1. Low stock best sellers
  const deliveredIds = await prisma.order.findMany({
    where: { orderStatus: 'DELIVERED' },
    select: { id: true },
  })
  const idList = deliveredIds.map(o => o.id)

  const topItems = idList.length > 0
    ? await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { orderId: { in: idList } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 20,
      })
    : []

  const topProductIds = topItems.map(r => r.productId)
  if (topProductIds.length > 0) {
    const topProducts = await prisma.product.findMany({
      where: { id: { in: topProductIds }, isActive: true },
      select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true, featuredOnHomepage: true },
    })
    const salesMap = new Map(topItems.map(r => [r.productId, r._sum.quantity ?? 0]))

    for (const p of topProducts) {
      const sold = salesMap.get(p.id) ?? 0
      if (p.stockQuantity <= p.lowStockThreshold && sold > 10) {
        recs.push({
          type: 'warning',
          title: `موجودی کم: ${p.name}`,
          body: 'این محصول پرفروش است اما موجودی آن پایین است. سریع‌تر تأمین کنید.',
        })
      }
      if (!p.featuredOnHomepage && sold > 20) {
        recs.push({
          type: 'success',
          title: `نمایش در صفحه اصلی: ${p.name}`,
          body: 'این محصول پرفروش است. نمایش در صفحه اصلی می‌تواند فروش را افزایش دهد.',
        })
      }
    }
  }

  // 2. Slow-moving categories
  const allSales = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
  })
  const salesByProduct = new Map(allSales.map(r => [r.productId, r._sum.quantity ?? 0]))

  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, category: { select: { name: true } } },
  })

  const catSales = new Map<string, number>()
  for (const p of activeProducts) {
    const name = p.category?.name ?? 'بدون دسته‌بندی'
    catSales.set(name, (catSales.get(name) ?? 0) + (salesByProduct.get(p.id) ?? 0))
  }
  for (const [name, total] of catSales.entries()) {
    if (total < 10) {
      recs.push({
        type: 'info',
        title: `دسته‌بندی کم‌فروش: ${name}`,
        body: 'این دسته‌بندی فروش کمتری داشته. کمپین تبلیغاتی یا تخفیف ویژه پیشنهاد می‌شود.',
      })
    }
  }

  // 3. Inactive customers
  const inactiveCount = await prisma.customer.count({
    where: { lastOrderAt: { lt: new Date(Date.now() - 90 * 86_400_000) } },
  })
  if (inactiveCount > 0) {
    recs.push({
      type: 'info',
      title: `${inactiveCount} مشتری غیرفعال`,
      body: 'این مشتریان بیش از ۹۰ روز است سفارشی ثبت نکرده‌اند. کمپین بازگشت مشتری پیشنهاد می‌شود.',
    })
  }

  // 4. High pending orders
  const pendingCount = await prisma.order.count({ where: { orderStatus: 'PENDING' } })
  if (pendingCount > 5) {
    recs.push({
      type: 'warning',
      title: `${pendingCount} سفارش در انتظار`,
      body: 'تعداد سفارشات در انتظار بررسی بالاست. پردازش سریع‌تر رضایت مشتریان را افزایش می‌دهد.',
    })
  }

  return recs.slice(0, 8)
}
