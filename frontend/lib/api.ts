import type { Admin, LoginResponse } from '@/types/admin'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/product'
import type { InventoryItem, InventoryAdjustment, AdjustStockInput, AdjustStockResult } from '@/types/inventory'
import type { Order, OrderListItem, OrderStatus, UpdatedOrderStatus, PublicOrder } from '@/types/order'
import type { PublicProduct, GetPublicProductsParams } from '@/types/public-product'
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

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentAdmin(): Promise<Admin> {
  const data = await apiFetch<{ admin: Admin }>('/api/admin/auth/me', {
    headers: authHeaders(),
  })
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
