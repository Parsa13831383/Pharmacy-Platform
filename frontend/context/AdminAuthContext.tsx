'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Admin } from '@/types/admin'
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '@/lib/api'
import { getToken, saveToken, removeToken } from '@/lib/auth'

interface AdminAuthContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  const DEV = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    const token = getToken()
    if (DEV) console.log('[AUTH] context init — cookie token present:', !!token)
    if (!token) {
      setLoading(false)
      return
    }

    getCurrentAdmin()
      .then((a) => {
        if (DEV) console.log('[AUTH] context init — getCurrentAdmin ok:', a?.email)
        setAdmin(a)
      })
      .catch((err) => {
        if (DEV) console.log('[AUTH] context init — getCurrentAdmin FAILED:', (err as Error)?.message)
        setAdmin(null)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, admin } = await loginAdmin(email, password)
    if (DEV) console.log('[AUTH] login success — saving cookie for:', admin?.email)
    saveToken(token)
    setAdmin(admin)
    if (DEV) console.log('[AUTH] admin state set — isAuthenticated will be true')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutAdmin()
    } catch {
      // best-effort server logout
    } finally {
      removeToken()
      setAdmin(null)
    }
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
