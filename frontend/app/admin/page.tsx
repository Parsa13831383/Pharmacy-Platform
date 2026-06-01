'use client'

import Link from 'next/link'
import { Archive, BarChart2, Package, ShoppingBag, Sparkles, Tag } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'مالک',
  ADMIN: 'مدیر',
  STAFF: 'کارمند',
}

const CARDS = [
  { icon: Package, label: 'محصولات', desc: 'مدیریت محصولات فروشگاه', href: '/admin/products' },
  { icon: Tag, label: 'دسته‌بندی‌ها', desc: 'مدیریت دسته‌بندی‌ها', href: '/admin/categories' },
  { icon: Archive, label: 'موجودی', desc: 'کنترل موجودی انبار', href: '/admin/inventory' },
  { icon: ShoppingBag, label: 'سفارش‌ها', desc: 'پیگیری سفارشات', href: '/admin/orders' },
  { icon: Sparkles, label: 'جشنواره‌ها', desc: 'مدیریت تخفیف‌ها و کمپین‌ها', href: '/admin/promotions' },
  { icon: BarChart2, label: 'گزارش‌ها', desc: 'تحلیل فروش و آمار عملکرد', href: '/admin/reports' },
]

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth()
  const roleLabel = ROLE_LABELS[admin?.role ?? ''] ?? (admin?.role ?? '')

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">خوش آمدید، {roleLabel}</h1>
        <p className="text-muted-foreground text-sm">{admin?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map(({ icon: Icon, label, desc, href }) => {
          const card = (
            <div
              className={cn(
                'bg-card rounded-2xl border p-6 transition-all h-full',
                href
                  ? 'border-border hover:border-primary/40 hover:shadow-sm'
                  : 'border-border opacity-50',
              )}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{label}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          )

          return href ? (
            <Link key={label} href={href} className="block">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          )
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">اطلاعات حساب</h2>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-muted-foreground text-sm">ایمیل</span>
            <span className="font-medium text-foreground text-sm">{admin?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-muted-foreground text-sm">شناسه</span>
            <span className="font-mono text-xs text-muted-foreground">{admin?.id}</span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-muted-foreground text-sm">نقش</span>
            <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
