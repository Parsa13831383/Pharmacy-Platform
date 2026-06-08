import type { Request, Response } from 'express'
import {
  getInsightsOverview,
  getRevenueTrend,
  getProductInsights,
  getCategoryInsights,
  getCustomerInsights,
  getInsightsRecommendations,
} from './insights.service'

function parseDays(req: Request): number {
  const raw = req.query['days']
  const n = parseInt(String(raw ?? '30'), 10)
  if ([7, 30, 90, 0].includes(n)) return n
  return 30
}

export async function overviewController(req: Request, res: Response) {
  try {
    const data = await getInsightsOverview(parseDays(req))
    res.json({ success: true, data })
  } catch (err) {
    console.error('[insights/overview]', err)
    res.status(500).json({ success: false, message: 'خطای سرور' })
  }
}

export async function revenueTrendController(req: Request, res: Response) {
  try {
    const data = await getRevenueTrend(parseDays(req))
    res.json({ success: true, data })
  } catch (err) {
    console.error('[insights/revenue-trend]', err)
    res.status(500).json({ success: false, message: 'خطای سرور' })
  }
}

export async function productsController(req: Request, res: Response) {
  try {
    const data = await getProductInsights(parseDays(req))
    res.json({ success: true, data })
  } catch (err) {
    console.error('[insights/products]', err)
    res.status(500).json({ success: false, message: 'خطای سرور' })
  }
}

export async function categoriesController(req: Request, res: Response) {
  try {
    const data = await getCategoryInsights(parseDays(req))
    res.json({ success: true, data })
  } catch (err) {
    console.error('[insights/categories]', err)
    res.status(500).json({ success: false, message: 'خطای سرور' })
  }
}

export async function customersController(req: Request, res: Response) {
  try {
    const data = await getCustomerInsights(parseDays(req))
    res.json({ success: true, data })
  } catch (err) {
    console.error('[insights/customers]', err)
    res.status(500).json({ success: false, message: 'خطای سرور' })
  }
}

export async function recommendationsController(_req: Request, res: Response) {
  try {
    const data = await getInsightsRecommendations()
    res.json({ success: true, data })
  } catch (err) {
    console.error('[insights/recommendations]', err)
    res.status(500).json({ success: false, message: 'خطای سرور' })
  }
}
