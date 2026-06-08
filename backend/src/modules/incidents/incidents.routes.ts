import { Router } from 'express'
import { authenticateAdmin } from '../../middleware/authenticateAdmin'
import { testAlertController, testEmergencyAlertController, listIncidentsController } from './incidents.controller'

const router = Router()

router.use(authenticateAdmin)

router.get('/',                       listIncidentsController)
router.post('/test-alert',            testAlertController)
router.post('/test-emergency-alert',  testEmergencyAlertController)

export default router
