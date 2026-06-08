export type CustomerSegment = 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE'

export interface CustomerListItem {
  id: string
  phone: string
  name: string
  firstOrderAt: string
  lastOrderAt: string
  totalOrders: number
  totalSpent: number
  marketingOptIn: boolean
  segment: CustomerSegment
  createdAt: string
  updatedAt: string
}

export interface CustomerListResponse {
  customers: CustomerListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CustomerOrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CustomerOrder {
  id: string
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  items: CustomerOrderItem[]
}

export interface CustomerTopProduct {
  productId: string
  name: string
  count: number
  totalSpent: number
}

export interface CustomerTopCategory {
  categoryId: string
  name: string
  slug: string
  count: number
}

export interface CustomerProfile extends CustomerListItem {
  notes: string | null
}

export interface CustomerRecentEvent {
  id: string
  eventType: string
  productId: string
  productName: string
  createdAt: string
}

export interface CustomerProfileResponse {
  customer: CustomerProfile
  orders: CustomerOrder[]
  topProducts: CustomerTopProduct[]
  topCategories: CustomerTopCategory[]
  recentEvents: CustomerRecentEvent[]
}

export interface CustomerStats {
  totalCustomers: number
  newThisMonth: number
  vipCustomers: number
  inactiveCustomers: number
  returningRate: number
}
