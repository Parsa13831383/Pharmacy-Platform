export type CheckoutContactMethod = 'PHONE' | 'SMS' | 'WHATSAPP'
export type CheckoutPaymentMethod = 'ONLINE' | 'PAY_ON_DELIVERY'

/** Returned from POST /api/checkout/send-otp (via apiFetch → json.data) */
export interface SendOtpResponse {
  message: string
  /** Only present in development */
  code?: string
}

/** Returned from POST /api/checkout/verify-otp */
export interface VerifyOtpResponse {
  verified: boolean
}

export interface OrderLineItem {
  productId: string
  quantity: number
}

export interface CreateOrderPayload {
  customerName: string
  customerPhone: string
  deliveryAddress: string
  deliveryNotes?: string
  deliveryLatitude: number
  deliveryLongitude: number
  contactMethod: CheckoutContactMethod
  paymentMethod: CheckoutPaymentMethod
  items: OrderLineItem[]
}

export interface CreatedOrderItem {
  productId: string
  productNameSnapshot: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CreatedOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  deliveryNotes?: string | null
  contactMethod: string
  paymentMethod: string
  totalAmount: string | number
  createdAt: string
}

/** Returned from POST /api/checkout/order */
export interface CreateOrderResponse {
  order: CreatedOrder
  items: CreatedOrderItem[]
}
