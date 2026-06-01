import type { Request, Response, NextFunction } from 'express'
import { env } from '../../config/env'
import * as svc from './media.service'

function buildUrl(subDir: string, filename: string): string {
  return `${env.BASE_URL}/uploads/${subDir}/${filename}`
}

// ─── Product images ───────────────────────────────────────────────────────────

export async function listProductImages(req: Request, res: Response, next: NextFunction) {
  try {
    const images = await svc.getProductImages(req.params['productId'] as string)
    res.json({ success: true, data: { images } })
  } catch (err) { next(err) }
}

export async function uploadProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' })
      return
    }
    const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true
    const url = buildUrl('products', req.file.filename)
    const image = await svc.addProductImage(req.params['productId'] as string, url, isPrimary)
    res.status(201).json({ success: true, data: { image } })
  } catch (err) { next(err) }
}

export async function deleteProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteProductImage(req.params['productId'] as string, req.params['imageId'] as string)
    res.json({ success: true, data: null })
  } catch (err) { next(err) }
}

export async function setPrimaryProductImage(req: Request, res: Response, next: NextFunction) {
  try {
    const image = await svc.setPrimaryProductImage(
      req.params['productId'] as string,
      req.params['imageId'] as string,
    )
    res.json({ success: true, data: { image } })
  } catch (err) { next(err) }
}

// ─── Promotion images ─────────────────────────────────────────────────────────

export async function listPromotionImages(req: Request, res: Response, next: NextFunction) {
  try {
    const images = await svc.getPromotionImages(req.params['promotionId'] as string)
    res.json({ success: true, data: { images } })
  } catch (err) { next(err) }
}

export async function uploadPromotionImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' })
      return
    }
    const url = buildUrl('promotions', req.file.filename)
    const image = await svc.addPromotionImage(req.params['promotionId'] as string, url)
    res.status(201).json({ success: true, data: { image } })
  } catch (err) { next(err) }
}

export async function deletePromotionImage(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deletePromotionImage(
      req.params['promotionId'] as string,
      req.params['imageId'] as string,
    )
    res.json({ success: true, data: null })
  } catch (err) { next(err) }
}
