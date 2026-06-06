import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  listCustomersController,
  getCustomerController,
  patchNotesController,
  getStatsController,
} from './customers.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/', listCustomersController)
router.get('/stats', getStatsController)
router.get('/:id', getCustomerController)
router.patch('/:id/notes', patchNotesController)

export default router
