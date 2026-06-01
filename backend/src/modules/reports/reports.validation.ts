import { z } from 'zod'

export const salesQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
})

export type SalesQuery = z.infer<typeof salesQuerySchema>
