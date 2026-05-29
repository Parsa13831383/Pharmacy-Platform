export type AdminRole = 'OWNER' | 'ADMIN' | 'STAFF'

export interface Admin {
  id: string
  email: string
  role: AdminRole
}

export interface LoginResponse {
  token: string
  admin: Admin
}
