import prisma from '../../lib/prisma'

// ─── Summary ──────────────────────────────────────────────────────────────────

export async function getSummary() {
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    revenueAgg,
    activeProducts,
    allActiveProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { orderStatus: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } },
    }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderStatus: 'DELIVERED' },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { stockQuantity: true, lowStockThreshold: true },
    }),
  ])

  const lowStockProducts = allActiveProducts.filter(
    p => p.stockQuantity <= p.lowStockThreshold,
  ).length

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    activeProducts,
    lowStockProducts,
  }
}

// ─── Sales overview ───────────────────────────────────────────────────────────

export async function getSalesOverview(days: number) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const orders = await prisma.order.findMany({
    where: { orderStatus: 'DELIVERED', createdAt: { gte: since } },
    select: { createdAt: true, totalAmount: true },
  })

  // Group by calendar date (UTC)
  const byDate = new Map<string, number>()
  for (const order of orders) {
    const date = order.createdAt.toISOString().slice(0, 10)
    byDate.set(date, (byDate.get(date) ?? 0) + Number(order.totalAmount))
  }

  return Array.from(byDate.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Top products ─────────────────────────────────────────────────────────────

export async function getTopProducts() {
  const rows = await prisma.orderItem.groupBy({
    by: ['productId', 'productNameSnapshot'],
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  return rows.map(row => ({
    productId: row.productId,
    productNameSnapshot: row.productNameSnapshot,
    totalQuantitySold: row._sum.quantity ?? 0,
    revenueGenerated: Number(row._sum.totalPrice ?? 0),
  }))
}

// ─── Low stock ────────────────────────────────────────────────────────────────

export async function getLowStockReport() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true },
    orderBy: { stockQuantity: 'asc' },
  })
  return products.filter(p => p.stockQuantity <= p.lowStockThreshold)
}

// ─── Order status breakdown ───────────────────────────────────────────────────

export async function getOrderStatusBreakdown() {
  const [pending, confirmed, preparing, sent, delivered, cancelled] = await Promise.all([
    prisma.order.count({ where: { orderStatus: 'PENDING' } }),
    prisma.order.count({ where: { orderStatus: 'CONFIRMED' } }),
    prisma.order.count({ where: { orderStatus: 'PREPARING' } }),
    prisma.order.count({ where: { orderStatus: 'SENT' } }),
    prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
  ])
  return { pending, confirmed, preparing, sent, delivered, cancelled }
}

// ─── Recent orders ────────────────────────────────────────────────────────────

export async function getRecentOrders() {
  return prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      totalAmount: true,
      orderStatus: true,
      createdAt: true,
    },
  })
}
