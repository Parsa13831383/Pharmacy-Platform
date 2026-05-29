import type { Request, Response, NextFunction } from 'express'
import type { AdminRole } from '@prisma/client'

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }

    if (req.admin.role === 'OWNER') {
      next()
      return
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
    }

    next()
  }
}
