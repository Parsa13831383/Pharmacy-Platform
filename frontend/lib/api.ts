import type { Admin, LoginResponse } from '@/types/admin'
import type {
  CustomerListResponse,
  CustomerProfileResponse,
  CustomerStats,
  CustomerListItem,
} from '@/types/customer'
import type {
  CampaignDraft,
  CampaignAudience,
  AudiencePreview,
  CreateCampaignDraftInput,
} from '@/types/marketing'
import type { HomepageSettings, UpdateHomepageSettingsInput } from '@/types/cms'
import type { ProductImage } from '@/types/product'
import type { PromotionImage } from '@/types/promotion'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/product'
import type { InventoryItem, InventoryAdjustment, AdjustStockInput, AdjustStockResult } from '@/types/inventory'
import type { Order, OrderListItem, OrderStatus, UpdatedOrderStatus, PublicOrder } from '@/types/order'
import type { PublicProduct, GetPublicProductsParams } from '@/types/public-product'
import type {
  Promotion,
  PublicPromotion,
  FeaturedProduct,
  CreatePromotionInput,
  UpdatePromotionInput,
} from '@/types/promotion'
import type {
  ReportsSummary,
  SalesDataPoint,
  TopProduct,
  LowStockItem,
  OrderStatusBreakdown,
  RecentOrder,
} from '@/types/reports'
import type {
  SendOtpResponse,
  VerifyOtpResponse,
  CreateOrderPayload,
  CreateOrderResponse,
} from '@/types/checkout'
import { getToken } from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message ?? 'خطایی رخ داد')
  }

  return json.data as T
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Auth ────────────────────────────────────────────────────────────────────

const DEV = process.env.NODE_ENV !== 'production'

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  if (DEV) console.log('[AUTH] loginAdmin → POST /api/admin/auth/login', email)
  const result = await apiFetch<LoginResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (DEV) console.log('[AUTH] loginAdmin ← success, token_len:', result.token?.length ?? 0)
  return result
}

export async function getCurrentAdmin(): Promise<Admin> {
  if (DEV) console.log('[AUTH] getCurrentAdmin → GET /api/admin/auth/me')
  const data = await apiFetch<{ admin: Admin }>('/api/admin/auth/me', {
    headers: authHeaders(),
  })
  if (DEV) console.log('[AUTH] getCurrentAdmin ←', data.admin?.email)
  return data.admin
}

export async function logoutAdmin(): Promise<void> {
  await apiFetch('/api/admin/auth/logout', {
    method: 'POST',
    headers: authHeaders(),
  })
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getAdminCategories(): Promise<Category[]> {
  const data = await apiFetch<{ categories: Category[] }>('/api/admin/categories', {
    headers: authHeaders(),
  })
  return data.categories
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const data = await apiFetch<{ category: Category }>('/api/admin/categories', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.category
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const data = await apiFetch<{ category: Category }>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.category
}

export async function deactivateCategory(id: string): Promise<Category> {
  const data = await apiFetch<{ category: Category }>(`/api/admin/categories/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  return data.category
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getAdminProducts(): Promise<Product[]> {
  const data = await apiFetch<{ products: Product[] }>('/api/admin/products', {
    headers: authHeaders(),
  })
  return data.products
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const data = await apiFetch<{ product: Product }>('/api/admin/products', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.product
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const data = await apiFetch<{ product: Product }>(`/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.product
}

export async function deactivateProduct(id: string): Promise<Product> {
  const data = await apiFetch<{ product: Product }>(`/api/admin/products/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  return data.product
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export async function getInventory(): Promise<InventoryItem[]> {
  const data = await apiFetch<{ inventory: InventoryItem[] }>('/api/admin/inventory', {
    headers: authHeaders(),
  })
  return data.inventory
}

export async function getLowStockInventory(): Promise<InventoryItem[]> {
  const data = await apiFetch<{ products: InventoryItem[] }>('/api/admin/inventory/low-stock', {
    headers: authHeaders(),
  })
  return data.products
}

export async function adjustInventoryStock(input: AdjustStockInput): Promise<AdjustStockResult> {
  return apiFetch<AdjustStockResult>('/api/admin/inventory/adjust', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
}

export async function getInventoryHistory(productId: string): Promise<InventoryAdjustment[]> {
  const data = await apiFetch<{ history: InventoryAdjustment[] }>(
    `/api/admin/inventory/${productId}/history`,
    { headers: authHeaders() },
  )
  return data.history
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getAdminOrders(): Promise<OrderListItem[]> {
  const data = await apiFetch<{ orders: OrderListItem[] }>('/api/admin/orders', {
    headers: authHeaders(),
  })
  return data.orders
}

export async function getAdminOrderById(id: string): Promise<Order> {
  const data = await apiFetch<{ order: Order }>(`/api/admin/orders/${id}`, {
    headers: authHeaders(),
  })
  return data.order
}

export async function updateAdminOrderStatus(
  id: string,
  orderStatus: OrderStatus,
): Promise<UpdatedOrderStatus> {
  const data = await apiFetch<{ order: UpdatedOrderStatus }>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ orderStatus }),
  })
  return data.order
}

// ─── Public Product Catalog ───────────────────────────────────────────────────

export async function getPublicProducts(
  params?: GetPublicProductsParams,
): Promise<PublicProduct[]> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.category) qs.set('category', params.category)
  if (params?.sort) qs.set('sort', params.sort)
  const query = qs.toString()
  const data = await apiFetch<{ products: PublicProduct[] }>(
    `/api/products${query ? `?${query}` : ''}`,
  )
  return data.products
}

export async function getPublicProductBySlug(slug: string): Promise<PublicProduct> {
  const data = await apiFetch<{ product: PublicProduct }>(`/api/products/${slug}`)
  return data.product
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function sendCheckoutOtp(phone: string): Promise<SendOtpResponse> {
  return apiFetch<SendOtpResponse>('/api/checkout/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export async function verifyCheckoutOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResponse> {
  return apiFetch<VerifyOtpResponse>('/api/checkout/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

export async function createCheckoutOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/api/checkout/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ─── Public Order Tracking ────────────────────────────────────────────────────

export async function getPublicOrderByNumber(orderNumber: string): Promise<PublicOrder> {
  const data = await apiFetch<{ order: PublicOrder }>(
    `/api/orders/${encodeURIComponent(orderNumber)}`,
  )
  return data.order
}

// ─── Admin Promotions ─────────────────────────────────────────────────────────

export async function getAdminPromotions(): Promise<Promotion[]> {
  const data = await apiFetch<{ promotions: Promotion[] }>('/api/admin/promotions', {
    headers: authHeaders(),
  })
  return data.promotions
}

export async function getAdminPromotionById(id: string): Promise<Promotion> {
  const data = await apiFetch<{ promotion: Promotion }>(`/api/admin/promotions/${id}`, {
    headers: authHeaders(),
  })
  return data.promotion
}

export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  const data = await apiFetch<{ promotion: Promotion }>('/api/admin/promotions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.promotion
}

export async function updatePromotion(id: string, input: UpdatePromotionInput): Promise<Promotion> {
  const data = await apiFetch<{ promotion: Promotion }>(`/api/admin/promotions/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.promotion
}

export async function deactivatePromotion(id: string): Promise<Promotion> {
  const data = await apiFetch<{ promotion: Promotion }>(`/api/admin/promotions/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  return data.promotion
}

export async function addProductsToPromotion(
  promotionId: string,
  productIds: string[],
): Promise<Promotion> {
  const data = await apiFetch<{ promotion: Promotion }>(
    `/api/admin/promotions/${promotionId}/products`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ productIds }),
    },
  )
  return data.promotion
}

export async function removeProductFromPromotion(
  promotionId: string,
  productId: string,
): Promise<Promotion> {
  const data = await apiFetch<{ promotion: Promotion }>(
    `/api/admin/promotions/${promotionId}/products/${productId}`,
    { method: 'DELETE', headers: authHeaders() },
  )
  return data.promotion
}

// ─── Public Promotions ────────────────────────────────────────────────────────

export async function getPublicPromotions(): Promise<PublicPromotion[]> {
  const data = await apiFetch<{ promotions: PublicPromotion[] }>('/api/promotions')
  return data.promotions
}

export async function getPublicPromotionBySlug(slug: string): Promise<PublicPromotion> {
  const data = await apiFetch<{ promotion: PublicPromotion }>(`/api/promotions/${slug}`)
  return data.promotion
}

export async function getFeaturedPromotionProducts(): Promise<FeaturedProduct[]> {
  const data = await apiFetch<{ products: FeaturedProduct[] }>('/api/promotions/featured/products')
  return data.products
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getReportsSummary(): Promise<ReportsSummary> {
  return apiFetch<ReportsSummary>('/api/admin/reports/summary', {
    headers: authHeaders(),
  })
}

export async function getSalesOverview(days: number): Promise<SalesDataPoint[]> {
  return apiFetch<SalesDataPoint[]>(`/api/admin/reports/sales-overview?days=${days}`, {
    headers: authHeaders(),
  })
}

export async function getTopProducts(): Promise<TopProduct[]> {
  return apiFetch<TopProduct[]>('/api/admin/reports/top-products', {
    headers: authHeaders(),
  })
}

export async function getLowStockReport(): Promise<LowStockItem[]> {
  return apiFetch<LowStockItem[]>('/api/admin/reports/low-stock', {
    headers: authHeaders(),
  })
}

export async function getOrderStatusReport(): Promise<OrderStatusBreakdown> {
  return apiFetch<OrderStatusBreakdown>('/api/admin/reports/order-status', {
    headers: authHeaders(),
  })
}

export async function getRecentOrdersReport(): Promise<RecentOrder[]> {
  return apiFetch<RecentOrder[]>('/api/admin/reports/recent-orders', {
    headers: authHeaders(),
  })
}

// ─── CMS ──────────────────────────────────────────────────────────────────────

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const data = await apiFetch<{ settings: HomepageSettings }>('/api/cms/homepage')
  return data.settings
}

export async function updateHomepageSettings(input: UpdateHomepageSettingsInput): Promise<HomepageSettings> {
  const data = await apiFetch<{ settings: HomepageSettings }>('/api/admin/cms/homepage', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  return data.settings
}

// ─── Featured Products ─────────────────────────────────────────────────────────

export async function getFeaturedProducts(): Promise<PublicProduct[]> {
  const data = await apiFetch<{ products: PublicProduct[] }>('/api/products/featured')
  return data.products
}

export async function toggleAdminProductFeatured(id: string): Promise<Product> {
  const data = await apiFetch<{ product: Product }>(`/api/admin/products/${id}/featured`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  return data.product
}

// ─── Featured Categories ───────────────────────────────────────────────────────

export async function getFeaturedCategories(): Promise<Category[]> {
  const data = await apiFetch<{ categories: Category[] }>('/api/categories/featured')
  return data.categories
}

export async function toggleAdminCategoryFeatured(id: string): Promise<Category> {
  const data = await apiFetch<{ category: Category }>(`/api/admin/categories/${id}/featured`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  return data.category
}

// ─── Public Categories ─────────────────────────────────────────────────────────

export async function getPublicCategories(): Promise<Category[]> {
  const data = await apiFetch<{ categories: Category[] }>('/api/categories')
  return data.categories
}

// ─── Media — Product images ────────────────────────────────────────────────────

async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'خطایی رخ داد')
  return json.data as T
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const data = await apiFetch<{ images: ProductImage[] }>(
    `/api/admin/media/products/${productId}`,
    { headers: authHeaders() },
  )
  return data.images
}

export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary = false,
): Promise<ProductImage> {
  const fd = new FormData()
  fd.append('image', file)
  if (isPrimary) fd.append('isPrimary', 'true')
  const data = await apiUpload<{ image: ProductImage }>(
    `/api/admin/media/products/${productId}`,
    fd,
  )
  return data.image
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await apiFetch(`/api/admin/media/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export async function setProductImagePrimary(
  productId: string,
  imageId: string,
): Promise<ProductImage> {
  const data = await apiFetch<{ image: ProductImage }>(
    `/api/admin/media/products/${productId}/images/${imageId}/primary`,
    { method: 'PATCH', headers: authHeaders() },
  )
  return data.image
}

// ─── Media — Promotion images ──────────────────────────────────────────────────

export async function getPromotionImages(promotionId: string): Promise<PromotionImage[]> {
  const data = await apiFetch<{ images: PromotionImage[] }>(
    `/api/admin/media/promotions/${promotionId}`,
    { headers: authHeaders() },
  )
  return data.images
}

export async function uploadPromotionImage(
  promotionId: string,
  file: File,
): Promise<PromotionImage> {
  const fd = new FormData()
  fd.append('image', file)
  const data = await apiUpload<{ image: PromotionImage }>(
    `/api/admin/media/promotions/${promotionId}`,
    fd,
  )
  return data.image
}

export async function deletePromotionImage(
  promotionId: string,
  imageId: string,
): Promise<void> {
  await apiFetch(`/api/admin/media/promotions/${promotionId}/images/${imageId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

// ─── Customers (CRM) ──────────────────────────────────────────────────────────

export async function getAdminCustomers(params?: {
  search?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  pageSize?: number
}): Promise<CustomerListResponse> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.sortBy) qs.set('sortBy', params.sortBy)
  if (params?.sortOrder) qs.set('sortOrder', params.sortOrder)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
  const query = qs.toString()
  return apiFetch<CustomerListResponse>(
    `/api/admin/customers${query ? `?${query}` : ''}`,
    { headers: authHeaders() },
  )
}

export async function getAdminCustomerById(id: string): Promise<CustomerProfileResponse> {
  return apiFetch<CustomerProfileResponse>(`/api/admin/customers/${id}`, {
    headers: authHeaders(),
  })
}

export async function updateCustomerNotes(id: string, notes: string | null): Promise<CustomerListItem> {
  const data = await apiFetch<{ customer: CustomerListItem }>(`/api/admin/customers/${id}/notes`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ notes }),
  })
  return data.customer
}

export async function getCustomerStats(): Promise<CustomerStats> {
  return apiFetch<CustomerStats>('/api/admin/customers/stats', {
    headers: authHeaders(),
  })
}

// ─── Marketing ────────────────────────────────────────────────────────────────

export async function getAdminCampaignDrafts(): Promise<CampaignDraft[]> {
  const data = await apiFetch<{ drafts: CampaignDraft[] }>('/api/admin/marketing/campaigns', {
    headers: authHeaders(),
  })
  return data.drafts
}

export async function createAdminCampaignDraft(input: CreateCampaignDraftInput): Promise<{
  draft: CampaignDraft
  estimatedCount: number
}> {
  return apiFetch<{ draft: CampaignDraft; estimatedCount: number }>(
    '/api/admin/marketing/campaigns',
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(input) },
  )
}

export async function getAudiencePreview(audience: CampaignAudience): Promise<AudiencePreview> {
  return apiFetch<AudiencePreview>(
    `/api/admin/marketing/audience-preview?audience=${audience}`,
    { headers: authHeaders() },
  )
}
