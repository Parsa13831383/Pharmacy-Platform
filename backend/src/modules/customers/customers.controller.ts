import type { Request, Response } from 'express'
import { AppError } from '../../lib/errors'
import { updateCustomerNotesSchema } from './customers.validation'
import {
  getCustomers,
  getCustomerById,
  updateCustomerNotes,
  getCustomerStats,
} from './customers.service'

export async function listCustomersController(req: Request, res: Response) {
  try {
    const { search, sortBy, sortOrder, page, pageSize } = req.query
    const result = await getCustomers({
      search: typeof search === 'string' ? search : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      sortOrder: typeof sortOrder === 'string' ? sortOrder : undefined,
      page: typeof page === 'string' ? parseInt(page, 10) : undefined,
      pageSize: typeof pageSize === 'string' ? parseInt(pageSize, 10) : undefined,
    })
    res.json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export async function getCustomerController(req: Request, res: Response) {
  try {
    const result = await getCustomerById(req.params['id'] as string)
    res.json({ success: true, data: result })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function patchNotesController(req: Request, res: Response) {
  const parsed = updateCustomerNotesSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' })
    return
  }
  try {
    const customer = await updateCustomerNotes(req.params['id'] as string, parsed.data)
    res.json({ success: true, data: { customer } })
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function getStatsController(_req: Request, res: Response) {
  try {
    const stats = await getCustomerStats()
    res.json({ success: true, data: stats })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
