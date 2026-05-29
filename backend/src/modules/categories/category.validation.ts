import { z } from 'zod'

const slugSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
