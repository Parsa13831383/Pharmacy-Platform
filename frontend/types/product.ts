import type { Category } from './category'

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountedPrice: number | null
  stockQuantity: number
  lowStockThreshold: number
  brand: string | null
  sku: string | null
  description: string | null
  isActive: boolean
  featuredOnHomepage: boolean
  categoryId: string | null
  category: Category | null
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  slug: string
  price: number
  categoryId?: string
  description?: string
  brand?: string
  sku?: string
  discountedPrice?: number
  stockQuantity?: number
}

export interface UpdateProductInput {
  name?: string
  slug?: string
  price?: number
  categoryId?: string
  description?: string
  brand?: string
  sku?: string
  discountedPrice?: number
  stockQuantity?: number
  isActive?: boolean
}
