import type { Request, Response, NextFunction } from 'express'
import { verifyAdminToken } from '../lib/jwt'
import prisma from '../lib/prisma'

export async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAdminToken(token)

    const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } })
    if (!admin) {
      res.status(401).json({ success: false, message: 'Admin not found' })
      return
    }

    if (!admin.isActive) {
      res.status(403).json({ success: false, message: 'Account is inactive' })
      return
    }

    req.admin = { id: admin.id, email: admin.email, role: admin.role }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
