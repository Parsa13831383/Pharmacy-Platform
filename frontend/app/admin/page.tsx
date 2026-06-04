'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Archive, BarChart2, Package, ShoppingBag, Sparkles, Tag } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { getReportsSummary, getOrderStatusReport } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ReportsSummary } from '@/types/reports'
import type { OrderStatusBreakdown } from '@/types/reports'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'مالک',
  ADMIN: 'مدیر',
  STAFF: 'کارمند',
}

const CARDS = [
  { icon: Package,   label: 'محصولات',    desc: 'مدیریت محصولات فروشگاه',          href: '/admin/products' },
  { icon: Tag,       label: 'دسته‌بندی‌ها', desc: 'مدیریت دسته‌بندی‌ها',           href: '/admin/categories' },
  { icon: Archive,   label: 'موجودی',     desc: 'کنترل موجودی انبار',              href: '/admin/inventory' },
  { icon: ShoppingBag, label: 'سفارش‌ها', desc: 'پیگیری سفارشات',                 href: '/admin/orders' },
  { icon: Sparkles,  label: 'جشنواره‌ها', desc: 'مدیریت تخفیف‌ها و کمپین‌ها',     href: '/admin/promotions' },
  { icon: BarChart2, label: 'گزارش‌ها',   desc: 'تحلیل فروش و آمار عملکرد',       href: '/admin/reports' },
]

function fmtPrice(n: number) {
  return n.toLocaleString('fa-IR') + ' تومان'
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth()
  const roleLabel = ROLE_LABELS[admin?.role ?? ''] ?? (admin?.role ?? '')

  const [summary, setSummary]           = useState<ReportsSummary | null>(null)
  const [breakdown, setBreakdown]       = useState<OrderStatusBreakdown | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getReportsSummary(), getOrderStatusReport()])
      .then(([s, b]) => { setSummary(s); setBreakdown(b) })
      .catch(() => {/* stats are best-effort — silently skip on error */})
      .finally(() => setStatsLoading(false))
  }, [])

  const statCards = summary && breakdown ? [
    { label: 'کل سفارشات',      value: summary.totalOrders.toLocaleString('fa-IR'),      color: 'text-foreground' },
    { label: 'در انتظار بررسی', value: summary.pendingOrders.toLocaleString('fa-IR'),     color: 'text-amber-600' },
    { label: 'تحویل داده شده',  value: summary.completedOrders.toLocaleString('fa-IR'),   color: 'text-emerald-600' },
    { label: 'لغو شده',          value: breakdown.cancelled.toLocaleString('fa-IR'),       color: 'text-destructive' },
    { label: 'درآمد تحویل‌ها',  value: fmtPrice(summary.totalRevenue),                   color: 'text-primary' },
    { label: 'محصولات فعال',    value: summary.activeProducts.toLocaleString('fa-IR'),    color: 'text-foreground' },
  ] : []

  return (
    <AdminShell>
      <div className="mb-8" dir="rtl">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          خوش آمدید، {roleLabel}
        </h1>
        <p className="text-muted-foreground text-sm">{admin?.email}</p>
      </div>

      {/* ── Live stats ─────────────────────────────────────────────────────── */}
      <div className="mb-8" dir="rtl">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">آمار کلی</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                <div className="h-3 bg-muted rounded w-2/3 mb-3" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : statCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map(({ label, value, color }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-5">
                <p className="text-muted-foreground text-xs mb-1.5 leading-tight">{label}</p>
                <p className={`text-lg font-bold tabular-nums leading-tight ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Navigation cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" dir="rtl">
        {CARDS.map(({ icon: Icon, label, desc, href }) => {
          const card = (
            <div className={cn(
              'bg-card rounded-2xl border p-6 transition-all h-full',
              'border-border hover:border-primary/40 hover:shadow-sm',
            )}>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{label}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          )
          return (
            <Link key={label} href={href} className="block">
              {card}
            </Link>
          )
        })}
      </div>

      {/* ── Account info ───────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border p-6" dir="rtl">
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
