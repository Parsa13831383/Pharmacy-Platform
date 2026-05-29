import { z } from 'zod'

export const adjustStockSchema = z.object({
  productId: z.string().min(1),
  quantityDelta: z.number().int().refine((v) => v !== 0, { message: 'quantityDelta cannot be 0' }),
  reason: z.string().min(1),
})

export type AdjustStockInput = z.infer<typeof adjustStockSchema>
