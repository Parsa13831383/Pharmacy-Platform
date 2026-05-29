import { Router } from 'express'
import { loginAdminController, getCurrentAdminController, logoutAdminController } from './auth.controller'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'

const router = Router()

router.post('/login', loginAdminController)
router.get('/me', authenticateAdmin, getCurrentAdminController)
router.post('/logout', authenticateAdmin, logoutAdminController)

export default router
