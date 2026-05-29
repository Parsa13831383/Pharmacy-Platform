import type { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma'
import { AppError } from '../../lib/errors'
import type { CreateCategoryInput, UpdateCategoryInput } from './category.validation'

export async function createCategory(input: CreateCategoryInput) {
  const exists = await prisma.category.findUnique({ where: { slug: input.slug } })
  if (exists) throw new AppError('A category with this slug already exists', 409)

  const data: Prisma.CategoryCreateInput = { name: input.name, slug: input.slug }
  if (input.description !== undefined) data.description = input.description

  return prisma.category.create({ data })
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError('Category not found', 404)
  return category
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError('Category not found', 404)

  if (input.slug !== undefined && input.slug !== category.slug) {
    const conflict = await prisma.category.findUnique({ where: { slug: input.slug } })
    if (conflict) throw new AppError('A category with this slug already exists', 409)
  }

  const data: Prisma.CategoryUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.slug !== undefined) data.slug = input.slug
  if (input.description !== undefined) data.description = input.description
  if (input.isActive !== undefined) data.isActive = input.isActive

  return prisma.category.update({ where: { id }, data })
}

export async function deactivateCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError('Category not found', 404)

  return prisma.category.update({ where: { id }, data: { isActive: false } })
}
