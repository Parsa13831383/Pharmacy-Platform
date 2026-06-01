import type { Request, Response } from 'express'
import {
  createPromotionSchema,
  updatePromotionSchema,
  addProductsSchema,
} from './promotion.validation'
import {
  listAdminPromotions,
  getAdminPromotionById,
  createPromotion,
  updatePromotion,
  deactivatePromotion,
  addProductsToPromotion,
  removeProductFromPromotion,
  listPublicPromotions,
  getPublicPromotionBySlug,
  getFeaturedProducts,
} from './promotion.service'
import { AppError } from '../../lib/errors'

// ─── Admin controllers ────────────────────────────────────────────────────────

export async function listAdminPromotionsController(_req: Request, res: Response) {
  try {
    const promotions = await listAdminPromotions()
    res.json({ success: true, data: { promotions } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getAdminPromotionController(req: Request, res: Response) {
  try {
    const promotion = await getAdminPromotionById(req.params['id'] as string)
    res.json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function createPromotionController(req: Request, res: Response) {
  const result = createPromotionSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const promotion = await createPromotion(result.data)
    res.status(201).json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function updatePromotionController(req: Request, res: Response) {
  const result = updatePromotionSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const promotion = await updatePromotion(req.params['id'] as string, result.data)
    res.json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function deactivatePromotionController(req: Request, res: Response) {
  try {
    const promotion = await deactivatePromotion(req.params['id'] as string)
    res.json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function addProductsController(req: Request, res: Response) {
  const result = addProductsSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const promotion = await addProductsToPromotion(req.params['id'] as string, result.data)
    res.json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function removeProductController(req: Request, res: Response) {
  try {
    const promotion = await removeProductFromPromotion(
      req.params['id'] as string,
      req.params['productId'] as string,
    )
    res.json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

// ─── Public controllers ───────────────────────────────────────────────────────

export async function listPublicPromotionsController(_req: Request, res: Response) {
  try {
    const promotions = await listPublicPromotions()
    res.json({ success: true, data: { promotions } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getPublicPromotionBySlugController(req: Request, res: Response) {
  try {
    const promotion = await getPublicPromotionBySlug(req.params['slug'] as string)
    res.json({ success: true, data: { promotion } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function getFeaturedProductsController(_req: Request, res: Response) {
  try {
    const products = await getFeaturedProducts()
    res.json({ success: true, data: { products } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
