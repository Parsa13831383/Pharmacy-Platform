import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  listAdminPromotionsController,
  getAdminPromotionController,
  createPromotionController,
  updatePromotionController,
  deactivatePromotionController,
  addProductsController,
  removeProductController,
  listPublicPromotionsController,
  getPublicPromotionBySlugController,
  getFeaturedProductsController,
} from './promotion.controller'

// ─── Admin routes (all require auth) ─────────────────────────────────────────

export const adminPromotionRouter = Router()

adminPromotionRouter.use(authenticateAdmin)
adminPromotionRouter.get('/', listAdminPromotionsController)
adminPromotionRouter.post('/', createPromotionController)
adminPromotionRouter.get('/:id', getAdminPromotionController)
adminPromotionRouter.patch('/:id', updatePromotionController)
adminPromotionRouter.patch('/:id/deactivate', deactivatePromotionController)
adminPromotionRouter.post('/:id/products', addProductsController)
adminPromotionRouter.delete('/:id/products/:productId', removeProductController)

// ─── Public routes ────────────────────────────────────────────────────────────

export const publicPromotionRouter = Router()

// featured MUST come before /:slug to avoid matching "featured" as a slug
publicPromotionRouter.get('/featured/products', getFeaturedProductsController)
publicPromotionRouter.get('/', listPublicPromotionsController)
publicPromotionRouter.get('/:slug', getPublicPromotionBySlugController)
