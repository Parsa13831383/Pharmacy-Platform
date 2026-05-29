import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  listAdminOrdersController,
  getAdminOrderController,
  updateOrderStatusController,
  getPublicOrderController,
} from './orders.controller'

export const adminOrderRouter = Router()

adminOrderRouter.use(authenticateAdmin)
adminOrderRouter.get('/', listAdminOrdersController)
adminOrderRouter.get('/:id', getAdminOrderController)
adminOrderRouter.patch('/:id/status', updateOrderStatusController)

export const publicOrderRouter = Router()

publicOrderRouter.get('/:orderNumber', getPublicOrderController)
