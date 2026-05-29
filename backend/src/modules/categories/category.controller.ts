import type { Request, Response } from 'express'
import { createCategorySchema, updateCategorySchema } from './category.validation'
import { createCategory, listCategories, getCategoryById, updateCategory, deactivateCategory } from './category.service'
import { AppError } from '../../lib/errors'

export async function createCategoryController(req: Request, res: Response) {
  const result = createCategorySchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const category = await createCategory(result.data)
    res.status(201).json({ success: true, data: { category } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function listCategoriesController(_req: Request, res: Response) {
  try {
    const categories = await listCategories()
    res.json({ success: true, data: { categories } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getCategoryController(req: Request, res: Response) {
  try {
    const category = await getCategoryById(req.params['id'] as string)
    res.json({ success: true, data: { category } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function updateCategoryController(req: Request, res: Response) {
  const result = updateCategorySchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const category = await updateCategory(req.params['id'] as string, result.data)
    res.json({ success: true, data: { category } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function deactivateCategoryController(req: Request, res: Response) {
  try {
    const category = await deactivateCategory(req.params['id'] as string)
    res.json({ success: true, data: { category } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
