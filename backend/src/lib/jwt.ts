import jwt from 'jsonwebtoken'
import type { AdminRole } from '@prisma/client'
import { env } from '../config/env'

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: AdminRole
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.ADMIN_JWT_SECRET, {
    expiresIn: env.ADMIN_JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET)
  return decoded as AdminTokenPayload
}
