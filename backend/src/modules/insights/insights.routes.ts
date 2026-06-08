import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  overviewController,
  revenueTrendController,
  productsController,
  categoriesController,
  customersController,
  recommendationsController,
} from './insights.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/overview', overviewController)
router.get('/revenue-trend', revenueTrendController)
router.get('/products', productsController)
router.get('/categories', categoriesController)
router.get('/customers', customersController)
router.get('/recommendations', recommendationsController)

export default router
