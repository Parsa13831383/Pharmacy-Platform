import type { Request, Response } from 'express'
import { adjustStockSchema } from './inventory.validation'
import { getInventoryList, getLowStockProducts, adjustStock, getInventoryHistory } from './inventory.service'
import { AppError } from '../../lib/errors'

export async function listInventoryController(_req: Request, res: Response) {
  try {
    const inventory = await getInventoryList()
    res.json({ success: true, data: { inventory } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getLowStockController(_req: Request, res: Response) {
  try {
    const products = await getLowStockProducts()
    res.json({ success: true, data: { products } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function adjustStockController(req: Request, res: Response) {
  const result = adjustStockSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }
  try {
    const data = await adjustStock(result.data)
    res.json({ success: true, data })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function getInventoryHistoryController(req: Request, res: Response) {
  try {
    const history = await getInventoryHistory(req.params['productId'] as string)
    res.json({ success: true, data: { history } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
