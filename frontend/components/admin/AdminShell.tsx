'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Leaf, LogOut, Package, Tag } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'مالک',
  ADMIN: 'مدیر',
  STAFF: 'کارمند',
}

const NAV_ITEMS = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'محصولات', icon: Package, exact: false },
  { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: Tag, exact: false },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { admin, loading, logout, isAuthenticated } = useAdminAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/admin/login')
    }
  }, [loading, isAuthenticated, router])

  async function handleLogout() {
    await logout()
    router.replace('/admin/login')
  }

  if (loading || !admin) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  const roleLabel = ROLE_LABELS[admin.role] ?? admin.role

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo + Nav */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary" />
              </div>
              <div className="leading-none hidden lg:block">
                <p className="font-bold text-foreground text-sm">داروخانه سبز</p>
                <p className="text-muted-foreground text-xs mt-0.5">پنل مدیریت</p>
              </div>
            </div>

            <nav className="flex items-center gap-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:block text-right leading-none">
              <p className="font-medium text-foreground text-sm">{admin.email}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{roleLabel}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
