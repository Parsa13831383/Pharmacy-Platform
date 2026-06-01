import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  getSummaryController,
  getSalesOverviewController,
  getTopProductsController,
  getLowStockController,
  getOrderStatusController,
  getRecentOrdersController,
} from './reports.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/summary', getSummaryController)
router.get('/sales-overview', getSalesOverviewController)
router.get('/top-products', getTopProductsController)
router.get('/low-stock', getLowStockController)
router.get('/order-status', getOrderStatusController)
router.get('/recent-orders', getRecentOrdersController)

export default router
