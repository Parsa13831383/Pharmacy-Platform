'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, loading, isAuthenticated } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/admin')
    }
  }, [loading, isAuthenticated, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      // Hard navigation so the browser sends the newly-set cookie at the
      // OS level — bypasses Next.js client-side routing which can race
      // against the proxy's cookie check.
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود')
      setSubmitting(false)
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">داروخانه سبز</h1>
          <p className="text-muted-foreground text-sm mt-1">پنل مدیریت</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-8">
          <h2 className="text-xl font-bold text-foreground mb-1">ورود به حساب</h2>
          <p className="text-muted-foreground text-sm mb-7">
            اطلاعات مدیریتی خود را وارد کنید
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@pharmacy.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                dir="ltr"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  dir="ltr"
                  className="h-11 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  در حال ورود...
                </span>
              ) : (
                'ورود'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
