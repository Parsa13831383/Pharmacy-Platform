import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  createProductController,
  listAdminProductsController,
  getAdminProductController,
  updateProductController,
  deactivateProductController,
  toggleProductFeaturedController,
  listFeaturedProductsController,
  listPublicProductsController,
  getPublicProductController,
} from './product.controller'

export const adminProductRouter = Router()

adminProductRouter.use(authenticateAdmin)
adminProductRouter.post('/', createProductController)
adminProductRouter.get('/', listAdminProductsController)
adminProductRouter.get('/:id', getAdminProductController)
adminProductRouter.patch('/:id', updateProductController)
adminProductRouter.patch('/:id/deactivate', deactivateProductController)
adminProductRouter.patch('/:id/featured', toggleProductFeaturedController)

export const publicProductRouter = Router()

publicProductRouter.get('/featured', listFeaturedProductsController)
publicProductRouter.get('/', listPublicProductsController)
publicProductRouter.get('/:slug', getPublicProductController)
