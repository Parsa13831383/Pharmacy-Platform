import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import type { AdjustStockInput } from './inventory.validation'

type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'

function computeStockStatus(stockQuantity: number, lowStockThreshold: number): StockStatus {
  if (stockQuantity === 0) return 'OUT_OF_STOCK'
  if (stockQuantity <= lowStockThreshold) return 'LOW_STOCK'
  return 'IN_STOCK'
}

export async function getInventoryList() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      stockQuantity: true,
      lowStockThreshold: true,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  })

  return products.map((p) => ({
    ...p,
    stockStatus: computeStockStatus(p.stockQuantity, p.lowStockThreshold),
  }))
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      stockQuantity: true,
      lowStockThreshold: true,
    },
    orderBy: { stockQuantity: 'asc' },
  })

  return products
    .filter((p) => p.stockQuantity <= p.lowStockThreshold)
    .map((p) => ({
      ...p,
      stockStatus: computeStockStatus(p.stockQuantity, p.lowStockThreshold),
    }))
}

export async function adjustStock(input: AdjustStockInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } })
    if (!product) throw new AppError('Product not found', 404)

    const newStock = product.stockQuantity + input.quantityDelta
    if (newStock < 0) throw new AppError('Insufficient stock', 400)

    const updatedProduct = await tx.product.update({
      where: { id: input.productId },
      data: { stockQuantity: newStock },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        isActive: true,
      },
    })

    const adjustment = await tx.inventoryAdjustment.create({
      data: {
        productId: input.productId,
        quantityDelta: input.quantityDelta,
        reason: input.reason,
      },
    })

    return {
      product: {
        ...updatedProduct,
        stockStatus: computeStockStatus(updatedProduct.stockQuantity, updatedProduct.lowStockThreshold),
      },
      adjustment,
    }
  })
}

export async function getInventoryHistory(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new AppError('Product not found', 404)

  return prisma.inventoryAdjustment.findMany({
    where: { productId },
    select: {
      id: true,
      quantityDelta: true,
      reason: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}
