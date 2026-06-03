export interface PublicProductCategory {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicProductImage {
  id: string
  imageUrl: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

/** Product returned from public catalog endpoints — prices are Decimal → serialised as string */
export interface PublicProduct {
  id: string
  name: string
  slug: string
  price: string
  discountedPrice: string | null
  stockQuantity: number
  lowStockThreshold: number
  brand: string | null
  sku: string | null
  description: string | null
  isActive: boolean
  featuredOnHomepage: boolean
  categoryId: string | null
  category: PublicProductCategory | null
  images: PublicProductImage[]
  createdAt: string
  updatedAt: string
}

/** Cart item stored in localStorage and cart context */
export interface CartItem {
  id: string
  slug: string
  name: string
  /** Effective price (discounted if available), as number for arithmetic */
  price: number
  /** Original price when a discount exists, null otherwise */
  originalPrice: number | null
  brand: string | null
  categoryName: string | null
  quantity: number
  stock: number
  /** Primary image URL (stored imageUrl value — resolved via getMediaUrl before rendering) */
  imageUrl: string | null
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc'

export interface GetPublicProductsParams {
  search?: string
  category?: string
  sort?: SortOption
}
