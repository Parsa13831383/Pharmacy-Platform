import { z } from 'zod'

// Accepts: 09xxxxxxxxx | +989xxxxxxxxx | 00989xxxxxxxxx (spaces/hyphens stripped)
const IRANIAN_MOBILE_RE = /^(\+98|0098|0)9\d{9}$/

const phoneField = z
  .string()
  .min(1, 'شماره تلفن الزامی است')
  .refine(
    (raw) => IRANIAN_MOBILE_RE.test(raw.replace(/[\s\-()]+/g, '')),
    'شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)',
  )

export const sendOtpSchema = z.object({
  phone: phoneField,
})

export const verifyOtpSchema = z.object({
  phone: phoneField,
  code: z
    .string()
    .length(6, 'کد تایید باید ۶ رقم باشد')
    .regex(/^\d{6}$/, 'کد تایید فقط شامل اعداد است'),
})

export const createOrderSchema = z.object({
  customerName:      z.string().min(1, 'نام الزامی است'),
  customerPhone:     phoneField,
  deliveryAddress:   z.string().min(1, 'آدرس الزامی است'),
  deliveryNotes:     z.string().optional(),
  deliveryLatitude:  z.number({ error: 'موقعیت جغرافیایی الزامی است' }),
  deliveryLongitude: z.number({ error: 'موقعیت جغرافیایی الزامی است' }),
  contactMethod:     z.enum(['PHONE', 'SMS', 'WHATSAPP']),
  paymentMethod:     z.enum(['ONLINE', 'PAY_ON_DELIVERY']),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity:  z.number().int().min(1),
      }),
    )
    .min(1, 'سبد خرید خالی است'),
})

export type SendOtpInput   = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
