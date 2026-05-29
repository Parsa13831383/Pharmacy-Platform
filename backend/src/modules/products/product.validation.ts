import { z } from 'zod'

const slugSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

export const createProductSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema,
    price: z.number().gt(0),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    sku: z.string().optional(),
    discountedPrice: z.number().gt(0).optional(),
    stockQuantity: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => data.discountedPrice === undefined || data.discountedPrice < data.price,
    { message: 'discountedPrice must be less than price', path: ['discountedPrice'] },
  )

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: slugSchema.optional(),
  price: z.number().gt(0).optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  discountedPrice: z.number().gt(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const publicProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type PublicProductsQuery = z.infer<typeof publicProductsQuerySchema>
