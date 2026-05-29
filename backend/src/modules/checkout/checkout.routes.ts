import { Router } from 'express'
import { sendOtpController, verifyOtpController, createOrderController } from './checkout.controller'

const router = Router()

router.post('/send-otp', sendOtpController)
router.post('/verify-otp', verifyOtpController)
router.post('/order', createOrderController)

export default router
