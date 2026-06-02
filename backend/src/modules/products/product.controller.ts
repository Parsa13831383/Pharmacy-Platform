import type { Request, Response } from 'express'
import { createProductSchema, updateProductSchema, publicProductsQuerySchema } from './product.validation'
import {
  createProduct,
  listAdminProducts,
  getAdminProductById,
  updateProduct,
  deactivateProduct,
  toggleProductFeatured,
  listFeaturedProducts,
  listPublicProducts,
  getPublicProductBySlug,
} from './product.service'
import { AppError } from '../../lib/errors'

export async function createProductController(req: Request, res: Response) {
  const result = createProductSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const product = await createProduct(result.data)
    res.status(201).json({ success: true, data: { product } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function listAdminProductsController(_req: Request, res: Response) {
  try {
    const products = await listAdminProducts()
    res.json({ success: true, data: { products } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getAdminProductController(req: Request, res: Response) {
  try {
    const product = await getAdminProductById(req.params['id'] as string)
    res.json({ success: true, data: { product } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function updateProductController(req: Request, res: Response) {
  const result = updateProductSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const product = await updateProduct(req.params['id'] as string, result.data)
    res.json({ success: true, data: { product } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function deactivateProductController(req: Request, res: Response) {
  try {
    const product = await deactivateProduct(req.params['id'] as string)
    res.json({ success: true, data: { product } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function toggleProductFeaturedController(req: Request, res: Response) {
  try {
    const product = await toggleProductFeatured(req.params['id'] as string)
    res.json({ success: true, data: { product } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function listFeaturedProductsController(_req: Request, res: Response) {
  try {
    const products = await listFeaturedProducts()
    res.json({ success: true, data: { products } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function listPublicProductsController(req: Request, res: Response) {
  const result = publicProductsQuerySchema.safeParse(req.query)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Invalid query parameters', errors: result.error.issues })
    return
  }
  try {
    const products = await listPublicProducts(result.data)
    res.json({ success: true, data: { products } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getPublicProductController(req: Request, res: Response) {
  try {
    const product = await getPublicProductBySlug(req.params['slug'] as string)
    res.json({ success: true, data: { product } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
