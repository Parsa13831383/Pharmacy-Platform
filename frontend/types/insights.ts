// ─── Overview ─────────────────────────────────────────────────────────────────

export interface InsightsOverview {
  totalRevenue: number
  periodRevenue: number
  periodOrders: number
  periodDelivered: number
  periodPending: number
  periodCancelled: number
  avgOrderValue: number
  returningRate: number
  allPending: number
  allDelivered: number
  allCancelled: number
}

// ─── Revenue Trend ────────────────────────────────────────────────────────────

export interface RevenueTrendPoint {
  date: string    // "YYYY-MM-DD"
  revenue: number
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface BestSellerProduct {
  productId: string
  name: string
  imageUrl: string | null
  quantitySold: number
  revenue: number
  currentStock: number
  lowStock: boolean
}

export interface SlowMovingProduct {
  id: string
  name: string
  stockQuantity: number
  totalSold: number
  imageUrl: string | null
}

export interface ProductInsights {
  bestSellers: BestSellerProduct[]
  slowMoving: SlowMovingProduct[]
  highDemandLowStock: BestSellerProduct[]
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface CategoryInsightItem {
  categoryId: string
  name: string
  slug: string
  revenue: number
  orders: number
  quantity: number
}

// ─── Customers ────────────────────────────────────────────────────────────────

export type CustomerSegment = 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE'

export interface TopCustomer {
  id: string
  name: string
  phone: string
  totalOrders: number
  totalSpent: number
  segment: CustomerSegment
  lastOrderAt: string
}

export interface CustomerInsights {
  total: number
  newThisPeriod: number
  returning: number
  vip: number
  inactive: number
  top10: TopCustomer[]
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface Recommendation {
  type: 'warning' | 'success' | 'info'
  title: string
  body: string
}
