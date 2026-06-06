import { z } from 'zod'

export const updateCustomerNotesSchema = z.object({
  notes: z.string().max(2000).nullable(),
})

export type UpdateCustomerNotesInput = z.infer<typeof updateCustomerNotesSchema>
