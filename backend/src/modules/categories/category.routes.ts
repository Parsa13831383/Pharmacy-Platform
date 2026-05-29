import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  createCategoryController,
  listCategoriesController,
  getCategoryController,
  updateCategoryController,
  deactivateCategoryController,
} from './category.controller'

const router = Router()

router.use(authenticateAdmin)

router.post('/', createCategoryController)
router.get('/', listCategoriesController)
router.get('/:id', getCategoryController)
router.patch('/:id', updateCategoryController)
router.patch('/:id/deactivate', deactivateCategoryController)

export default router
