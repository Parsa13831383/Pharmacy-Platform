import { z } from 'zod'

const slugRegex = /^[a-z0-9-]+$/

export const createPromotionSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().min(1).regex(slugRegex, 'Slug must only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    bannerText: z.string().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    data => {
      if (data.startsAt && data.endsAt) {
        return new Date(data.endsAt) > new Date(data.startsAt)
      }
      return true
    },
    { message: 'endsAt must be after startsAt', path: ['endsAt'] },
  )

export const updatePromotionSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).regex(slugRegex).optional(),
    description: z.string().optional(),
    bannerText: z.string().optional(),
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    data => {
      if (data.startsAt && data.endsAt) {
        return new Date(data.endsAt) > new Date(data.startsAt)
      }
      return true
    },
    { message: 'endsAt must be after startsAt', path: ['endsAt'] },
  )

export const addProductsSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1),
})

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>
export type AddProductsInput = z.infer<typeof addProductsSchema>
