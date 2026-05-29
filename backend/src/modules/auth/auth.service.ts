import prisma from '../../lib/prisma'
import { comparePassword } from '../../lib/bcrypt'
import { signAdminToken } from '../../lib/jwt'
import type { LoginInput } from './auth.validation'

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function loginAdmin(input: LoginInput) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } })

  if (!admin) {
    throw new AuthError('Invalid credentials', 401)
  }

  if (!admin.isActive) {
    throw new AuthError('Account is inactive', 403)
  }

  const valid = await comparePassword(input.password, admin.passwordHash)
  if (!valid) {
    throw new AuthError('Invalid credentials', 401)
  }

  const token = signAdminToken({ adminId: admin.id, email: admin.email, role: admin.role })

  const { passwordHash: _pw, ...safeAdmin } = admin
  return { token, admin: safeAdmin }
}

export async function getAdminById(adminId: string) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } })
  if (!admin) return null
  const { passwordHash: _pw, ...safeAdmin } = admin
  return safeAdmin
}
