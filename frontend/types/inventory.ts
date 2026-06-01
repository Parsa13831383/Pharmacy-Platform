export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'

export interface InventoryItem {
  id: string
  name: string
  sku: string | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  stockStatus: StockStatus
}

export interface InventoryAdjustment {
  id: string
  quantityDelta: number
  reason: string
  createdAt: string
}

export interface AdjustStockInput {
  productId: string
  quantityDelta: number
  reason: string
}

export interface AdjustStockResult {
  product: InventoryItem
  adjustment: InventoryAdjustment & { productId: string }
}
