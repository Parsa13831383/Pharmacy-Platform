import { z } from 'zod'

export const sendOtpSchema = z.object({
  phone: z.string().min(1),
})

export const verifyOtpSchema = z.object({
  phone: z.string().min(1),
  code: z.string().length(6),
})

export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryNotes: z.string().optional(),
  contactMethod: z.enum(['PHONE', 'SMS', 'WHATSAPP']),
  paymentMethod: z.enum(['ONLINE', 'PAY_ON_DELIVERY']),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
})

export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
