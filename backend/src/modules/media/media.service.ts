import fs from 'fs'
import path from 'path'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'

// ─── Product images ───────────────────────────────────────────────────────────

export async function getProductImages(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new AppError('Product not found', 404)

  return prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function addProductImage(
  productId: string,
  imageUrl: string,
  isPrimary: boolean,
) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new AppError('Product not found', 404)

  // First image for this product is automatically primary
  const existing = await prisma.productImage.count({ where: { productId } })
  const shouldBePrimary = isPrimary || existing === 0

  if (shouldBePrimary) {
    await prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    })
  }

  return prisma.productImage.create({
    data: {
      productId,
      imageUrl,
      isPrimary: shouldBePrimary,
      sortOrder: existing,
    },
  })
}

export async function deleteProductImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image || image.productId !== productId) throw new AppError('Image not found', 404)

  // Delete file from disk (basename only — prevents path traversal)
  const filename = path.basename(image.imageUrl)
  const filePath = path.join(process.cwd(), 'uploads', 'products', filename)
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch {
    // File removal failure is non-fatal
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  // If deleted image was primary, promote the next image
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } })
    }
  }
}

export async function setPrimaryProductImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } })
  if (!image || image.productId !== productId) throw new AppError('Image not found', 404)

  await prisma.productImage.updateMany({
    where: { productId, isPrimary: true },
    data: { isPrimary: false },
  })
  return prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } })
}

// ─── Promotion images ─────────────────────────────────────────────────────────

export async function getPromotionImages(promotionId: string) {
  const promo = await prisma.promotion.findUnique({ where: { id: promotionId } })
  if (!promo) throw new AppError('Promotion not found', 404)

  return prisma.promotionImage.findMany({
    where: { promotionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function addPromotionImage(promotionId: string, imageUrl: string) {
  const promo = await prisma.promotion.findUnique({ where: { id: promotionId } })
  if (!promo) throw new AppError('Promotion not found', 404)

  return prisma.promotionImage.create({ data: { promotionId, imageUrl } })
}

export async function deletePromotionImage(promotionId: string, imageId: string) {
  const image = await prisma.promotionImage.findUnique({ where: { id: imageId } })
  if (!image || image.promotionId !== promotionId) throw new AppError('Image not found', 404)

  const filename = path.basename(image.imageUrl)
  const filePath = path.join(process.cwd(), 'uploads', 'promotions', filename)
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch {
    // non-fatal
  }

  await prisma.promotionImage.delete({ where: { id: imageId } })
}
