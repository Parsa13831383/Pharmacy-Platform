import type { Request, Response } from 'express'
import { salesQuerySchema } from './reports.validation'
import {
  getSummary,
  getSalesOverview,
  getTopProducts,
  getLowStockReport,
  getOrderStatusBreakdown,
  getRecentOrders,
} from './reports.service'

export async function getSummaryController(_req: Request, res: Response) {
  try {
    const data = await getSummary()
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getSalesOverviewController(req: Request, res: Response) {
  const result = salesQuerySchema.safeParse(req.query)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Invalid query parameters' })
    return
  }
  try {
    const data = await getSalesOverview(result.data.days)
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getTopProductsController(_req: Request, res: Response) {
  try {
    const data = await getTopProducts()
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getLowStockController(_req: Request, res: Response) {
  try {
    const data = await getLowStockReport()
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getOrderStatusController(_req: Request, res: Response) {
  try {
    const data = await getOrderStatusBreakdown()
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getRecentOrdersController(_req: Request, res: Response) {
  try {
    const data = await getRecentOrders()
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
