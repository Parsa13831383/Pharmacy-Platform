import { z } from 'zod'

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'SENT', 'DELIVERED', 'CANCELLED']),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
