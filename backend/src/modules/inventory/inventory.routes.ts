import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  listInventoryController,
  getLowStockController,
  adjustStockController,
  getInventoryHistoryController,
} from './inventory.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/', listInventoryController)
router.get('/low-stock', getLowStockController)
router.post('/adjust', adjustStockController)
router.get('/:productId/history', getInventoryHistoryController)

export default router
