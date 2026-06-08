import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import {
  listCustomersController,
  getCustomerController,
  patchNotesController,
  getStatsController,
  backfillController,
  linkSessionController,
} from './customers.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/',              listCustomersController)
router.get('/stats',         getStatsController)
router.post('/backfill',     backfillController)
router.post('/link-session', linkSessionController)
router.get('/:id',           getCustomerController)
router.patch('/:id/notes',   patchNotesController)

export default router
