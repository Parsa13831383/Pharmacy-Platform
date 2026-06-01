import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import type { CreatePromotionInput, UpdatePromotionInput, AddProductsInput } from './promotion.validation'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function activePromotionWhere(now = new Date()) {
  return {
    isActive: true,
    AND: [
      { OR: [{ startsAt: null as Date | null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null as Date | null }, { endsAt: { gte: now } }] },
    ],
  }
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  discountedPrice: true,
  stockQuantity: true,
  lowStockThreshold: true,
  isActive: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
} as const

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listAdminPromotions() {
  return prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  })
}

export async function getAdminPromotionById(id: string) {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      products: {
        include: { product: { select: productSelect } },
        orderBy: { id: 'asc' },
      },
      _count: { select: { products: true } },
    },
  })
  if (!promotion) throw new AppError('Promotion not found', 404)
  return promotion
}

export async function createPromotion(input: CreatePromotionInput) {
  const existing = await prisma.promotion.findUnique({ where: { slug: input.slug } })
  if (existing) throw new AppError('A promotion with this slug already exists', 409)

  return prisma.promotion.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      bannerText: input.bannerText ?? null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      isActive: input.isActive ?? true,
    },
    include: { _count: { select: { products: true } } },
  })
}

export async function updatePromotion(id: string, input: UpdatePromotionInput) {
  const promotion = await prisma.promotion.findUnique({ where: { id } })
  if (!promotion) throw new AppError('Promotion not found', 404)

  if (input.slug && input.slug !== promotion.slug) {
    const conflict = await prisma.promotion.findUnique({ where: { slug: input.slug } })
    if (conflict) throw new AppError('A promotion with this slug already exists', 409)
  }

  return prisma.promotion.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description ?? null }),
      ...(input.bannerText !== undefined && { bannerText: input.bannerText ?? null }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.startsAt !== undefined && {
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
      }),
      ...(input.endsAt !== undefined && {
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      }),
    },
    include: { _count: { select: { products: true } } },
  })
}

export async function deactivatePromotion(id: string) {
  const promotion = await prisma.promotion.findUnique({ where: { id } })
  if (!promotion) throw new AppError('Promotion not found', 404)
  return prisma.promotion.update({
    where: { id },
    data: { isActive: false },
    include: { _count: { select: { products: true } } },
  })
}

export async function addProductsToPromotion(id: string, input: AddProductsInput) {
  const promotion = await prisma.promotion.findUnique({ where: { id } })
  if (!promotion) throw new AppError('Promotion not found', 404)

  const products = await prisma.product.findMany({
    where: { id: { in: input.productIds } },
    select: { id: true },
  })
  if (products.length !== input.productIds.length) {
    throw new AppError('One or more products not found', 404)
  }

  await prisma.promotionProduct.createMany({
    data: input.productIds.map(productId => ({ promotionId: id, productId })),
    skipDuplicates: true,
  })

  return getAdminPromotionById(id)
}

export async function removeProductFromPromotion(promotionId: string, productId: string) {
  const link = await prisma.promotionProduct.findUnique({
    where: { promotionId_productId: { promotionId, productId } },
  })
  if (!link) throw new AppError('Product is not in this promotion', 404)

  await prisma.promotionProduct.delete({
    where: { promotionId_productId: { promotionId, productId } },
  })

  return getAdminPromotionById(promotionId)
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function listPublicPromotions() {
  return prisma.promotion.findMany({
    where: activePromotionWhere(),
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPublicPromotionBySlug(slug: string) {
  const filter = activePromotionWhere()
  const promotion = await prisma.promotion.findFirst({
    where: { slug, ...filter },
    include: {
      products: {
        where: { product: { isActive: true } },
        include: { product: { select: productSelect } },
        orderBy: { id: 'asc' },
      },
    },
  })
  if (!promotion) throw new AppError('Promotion not found', 404)
  return promotion
}

export async function getFeaturedProducts(limit = 8) {
  const filter = activePromotionWhere()
  return prisma.product.findMany({
    where: {
      isActive: true,
      promotions: {
        some: { promotion: filter },
      },
    },
    select: { ...productSelect, sku: true, description: true, createdAt: true, updatedAt: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}
