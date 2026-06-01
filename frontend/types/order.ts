export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SENT'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'

export type PaymentMethod = 'ONLINE' | 'PAY_ON_DELIVERY'

export type ContactMethod = 'PHONE' | 'SMS' | 'WHATSAPP'

export interface OrderItem {
  id: string
  productId: string
  productNameSnapshot: string
  quantity: number
  unitPrice: string
  totalPrice: string
}

/** Full order — returned by GET /api/admin/orders/:id */
export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  deliveryNotes: string | null
  contactMethod: ContactMethod
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  totalAmount: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

/** List view — returned by GET /api/admin/orders (no items, no address fields) */
export interface OrderListItem {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  totalAmount: string
  createdAt: string
}

/** Returned by PATCH /api/admin/orders/:id/status */
export interface UpdatedOrderStatus {
  id: string
  orderNumber: string
  orderStatus: OrderStatus
  updatedAt: string
}
