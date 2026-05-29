import type { Request, Response } from 'express'
import { loginSchema } from './auth.validation'
import { loginAdmin, getAdminById, AuthError } from './auth.service'

export async function loginAdminController(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues })
    return
  }

  try {
    const data = await loginAdmin(result.data)
    res.json({ success: true, data })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export async function getCurrentAdminController(req: Request, res: Response) {
  const adminId = req.admin?.id
  if (!adminId) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }

  const admin = await getAdminById(adminId)
  if (!admin) {
    res.status(404).json({ success: false, message: 'Admin not found' })
    return
  }

  res.json({ success: true, data: { admin } })
}

export function logoutAdminController(_req: Request, res: Response) {
  res.json({ success: true, message: 'Logged out successfully' })
}
