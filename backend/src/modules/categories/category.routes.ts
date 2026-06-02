import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  createCategoryController,
  listCategoriesController,
  getCategoryController,
  updateCategoryController,
  deactivateCategoryController,
  toggleCategoryFeaturedController,
  listFeaturedCategoriesController,
} from './category.controller'

export const adminCategoryRouter = Router()

adminCategoryRouter.use(authenticateAdmin)
adminCategoryRouter.post('/', createCategoryController)
adminCategoryRouter.get('/', listCategoriesController)
adminCategoryRouter.get('/:id', getCategoryController)
adminCategoryRouter.patch('/:id', updateCategoryController)
adminCategoryRouter.patch('/:id/deactivate', deactivateCategoryController)
adminCategoryRouter.patch('/:id/featured', toggleCategoryFeaturedController)

export const publicCategoryRouter = Router()

publicCategoryRouter.get('/featured', listFeaturedCategoriesController)
publicCategoryRouter.get('/', listCategoriesController)
