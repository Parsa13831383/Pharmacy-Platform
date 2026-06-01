export interface PromotionImage {
  id: string
  promotionId: string
  imageUrl: string
  createdAt: string
}

/** Product shape nested inside PromotionProduct relations */
export interface PromotionProductDetail {
  id: string
  name: string
  slug: string
  brand: string | null
  price: string
  discountedPrice: string | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  category: { id: string; name: string; slug: string } | null
}

export interface PromotionProductItem {
  id: string
  promotionId: string
  productId: string
  product: PromotionProductDetail
}

/** Admin-facing promotion (includes _count.products) */
export interface Promotion {
  id: string
  title: string
  slug: string
  description: string | null
  bannerText: string | null
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  products?: PromotionProductItem[]
  images?: PromotionImage[]
  _count?: { products: number }
}

/** Public-facing promotion (same shape, always active) */
export type PublicPromotion = Omit<Promotion, '_count'>

/** Product returned by GET /api/promotions/featured/products */
export interface FeaturedProduct {
  id: string
  name: string
  slug: string
  brand: string | null
  price: string
  discountedPrice: string | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  sku: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  category: { id: string; name: string; slug: string } | null
}

export interface CreatePromotionInput {
  title: string
  slug: string
  description?: string
  bannerText?: string
  startsAt?: string
  endsAt?: string
  isActive?: boolean
}

export interface UpdatePromotionInput {
  title?: string
  slug?: string
  description?: string
  bannerText?: string
  startsAt?: string | null
  endsAt?: string | null
  isActive?: boolean
}
