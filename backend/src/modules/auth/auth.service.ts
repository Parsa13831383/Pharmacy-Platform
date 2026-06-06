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

const DEBUG = process.env.NODE_ENV !== 'production'

export async function loginAdmin(input: LoginInput) {
  if (DEBUG) console.log('[AUTH] login attempt:', input.email)

  const admin = await prisma.admin.findUnique({ where: { email: input.email } })
  if (DEBUG) console.log('[AUTH] admin found:', !!admin, '| active:', admin?.isActive)

  if (!admin) {
    if (DEBUG) console.log('[AUTH] FAIL — admin not found')
    throw new AuthError('Invalid credentials', 401)
  }

  if (!admin.isActive) {
    if (DEBUG) console.log('[AUTH] FAIL — account inactive')
    throw new AuthError('Account is inactive', 403)
  }

  const valid = await comparePassword(input.password, admin.passwordHash)
  if (DEBUG) console.log('[AUTH] password valid:', valid)

  if (!valid) {
    if (DEBUG) console.log('[AUTH] FAIL — wrong password')
    throw new AuthError('Invalid credentials', 401)
  }

  const token = signAdminToken({ adminId: admin.id, email: admin.email, role: admin.role })
  if (DEBUG) console.log('[AUTH] token signed — login OK')

  const { passwordHash: _pw, ...safeAdmin } = admin
  return { token, admin: safeAdmin }
}

export async function getAdminById(adminId: string) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } })
  if (!admin) return null
  const { passwordHash: _pw, ...safeAdmin } = admin
  return safeAdmin
}
