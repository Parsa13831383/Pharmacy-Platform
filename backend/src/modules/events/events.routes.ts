import { Router } from 'express'
import { trackProductEventController } from './events.controller'

const router = Router()

// Public — no auth required. Tracking should never block the user.
router.post('/product', trackProductEventController)

export default router
