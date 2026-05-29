import type { Request, Response } from 'express'
import { sendOtpSchema, verifyOtpSchema, createOrderSchema } from './checkout.validation'
import { sendOtp, verifyOtp, createOrder } from './checkout.service'
import { AppError } from '../../lib/errors'

export async function sendOtpController(req: Request, res: Response) {
  const result = sendOtpSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const data = await sendOtp(result.data)
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function verifyOtpController(req: Request, res: Response) {
  const result = verifyOtpSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const data = await verifyOtp(result.data)
    res.json({ success: true, data })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function createOrderController(req: Request, res: Response) {
  const result = createOrderSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const data = await createOrder(result.data)
    res.status(201).json({ success: true, data })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
