import type { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import type { CreateProductInput, UpdateProductInput, PublicProductsQuery } from './product.validation'

function buildSortOrder(sort?: string): Prisma.ProductOrderByWithRelationInput {
  if (sort === 'price_asc') return { price: 'asc' }
  if (sort === 'price_desc') return { price: 'desc' }
  return { createdAt: 'desc' }
}

export async function createProduct(input: CreateProductInput) {
  const slugConflict = await prisma.product.findUnique({ where: { slug: input.slug } })
  if (slugConflict) throw new AppError('A product with this slug already exists', 409)

  if (input.sku) {
    const skuConflict = await prisma.product.findUnique({ where: { sku: input.sku } })
    if (skuConflict) throw new AppError('A product with this SKU already exists', 409)
  }

  const data: Prisma.ProductUncheckedCreateInput = {
    name: input.name,
    slug: input.slug,
    price: input.price,
  }
  if (input.categoryId !== undefined) data.categoryId = input.categoryId
  if (input.description !== undefined) data.description = input.description
  if (input.brand !== undefined) data.brand = input.brand
  if (input.sku !== undefined) data.sku = input.sku
  if (input.discountedPrice !== undefined) data.discountedPrice = input.discountedPrice
  if (input.stockQuantity !== undefined) data.stockQuantity = input.stockQuantity
  if (input.lowStockThreshold !== undefined) data.lowStockThreshold = input.lowStockThreshold

  return prisma.product.create({ data, include: { category: true, images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } } })
}

const imageInclude = { images: { orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] } }

export async function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, ...imageInclude },
  })
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, ...imageInclude },
  })
  if (!product) throw new AppError('Product not found', 404)
  return product
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new AppError('Product not found', 404)

  if (input.slug !== undefined && input.slug !== product.slug) {
    const conflict = await prisma.product.findUnique({ where: { slug: input.slug } })
    if (conflict) throw new AppError('A product with this slug already exists', 409)
  }

  if (input.sku !== undefined && input.sku !== product.sku) {
    const conflict = await prisma.product.findUnique({ where: { sku: input.sku } })
    if (conflict) throw new AppError('A product with this SKU already exists', 409)
  }

  const effectivePrice = input.price ?? Number(product.price)
  if (input.discountedPrice !== undefined && input.discountedPrice >= effectivePrice) {
    throw new AppError('discountedPrice must be less than price', 400)
  }

  const data: Prisma.ProductUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.slug !== undefined) data.slug = input.slug
  if (input.price !== undefined) data.price = input.price
  if (input.description !== undefined) data.description = input.description
  if (input.brand !== undefined) data.brand = input.brand
  if (input.sku !== undefined) data.sku = input.sku
  if (input.discountedPrice !== undefined) data.discountedPrice = input.discountedPrice
  if (input.stockQuantity !== undefined) data.stockQuantity = input.stockQuantity
  if (input.lowStockThreshold !== undefined) data.lowStockThreshold = input.lowStockThreshold
  if (input.isActive !== undefined) data.isActive = input.isActive
  if (input.categoryId !== undefined) {
    data.category = input.categoryId
      ? { connect: { id: input.categoryId } }
      : { disconnect: true }
  }

  return prisma.product.update({ where: { id }, data, include: { category: true, ...imageInclude } })
}

export async function deactivateProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new AppError('Product not found', 404)

  return prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: { category: true, ...imageInclude },
  })
}

export async function toggleProductFeatured(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new AppError('Product not found', 404)
  return prisma.product.update({
    where: { id },
    data: { featuredOnHomepage: !product.featuredOnHomepage },
    include: { category: true, ...imageInclude },
  })
}

export async function listFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, featuredOnHomepage: true },
    orderBy: { updatedAt: 'desc' },
    include: { category: true, ...imageInclude },
  })
}

export async function listPublicProducts(query: PublicProductsQuery) {
  const where: Prisma.ProductWhereInput = { isActive: true }

  if (query.category) {
    where.category = { slug: query.category, isActive: true }
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { brand: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  return prisma.product.findMany({
    where,
    orderBy: buildSortOrder(query.sort),
    include: { category: true, ...imageInclude },
  })
}

export async function getPublicProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true, ...imageInclude },
  })
  if (!product) throw new AppError('Product not found', 404)
  return product
}
