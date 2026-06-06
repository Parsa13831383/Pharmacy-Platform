import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import { listDraftsController, createDraftController, audiencePreviewController } from './marketing.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/campaigns', listDraftsController)
router.post('/campaigns', createDraftController)
router.get('/audience-preview', audiencePreviewController)

export default router
