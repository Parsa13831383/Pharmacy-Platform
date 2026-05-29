import type { Request, Response } from 'express'
import { updateOrderStatusSchema } from './orders.validation'
import { listAdminOrders, getAdminOrderById, updateOrderStatus, getPublicOrderByNumber } from './orders.service'
import { AppError } from '../../lib/errors'

export async function listAdminOrdersController(_req: Request, res: Response) {
  try {
    const orders = await listAdminOrders()
    res.json({ success: true, data: { orders } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getAdminOrderController(req: Request, res: Response) {
  try {
    const order = await getAdminOrderById(req.params['id'] as string)
    res.json({ success: true, data: { order } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function updateOrderStatusController(req: Request, res: Response) {
  const result = updateOrderStatusSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const order = await updateOrderStatus(req.params['id'] as string, result.data)
    res.json({ success: true, data: { order } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function getPublicOrderController(req: Request, res: Response) {
  try {
    const order = await getPublicOrderByNumber(req.params['orderNumber'] as string)
    res.json({ success: true, data: { order } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
