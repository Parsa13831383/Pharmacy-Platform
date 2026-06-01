export interface ReportsSummary {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  /** Total delivered-order revenue in Toman */
  totalRevenue: number
  activeProducts: number
  lowStockProducts: number
}

export interface SalesDataPoint {
  date: string   // "YYYY-MM-DD"
  revenue: number
}

export interface TopProduct {
  productId: string
  productNameSnapshot: string
  totalQuantitySold: number
  revenueGenerated: number
}

export interface LowStockItem {
  id: string
  name: string
  sku: string | null
  stockQuantity: number
  lowStockThreshold: number
}

export interface OrderStatusBreakdown {
  pending: number
  confirmed: number
  preparing: number
  sent: number
  delivered: number
  cancelled: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  totalAmount: string
  orderStatus: string
  createdAt: string
}
