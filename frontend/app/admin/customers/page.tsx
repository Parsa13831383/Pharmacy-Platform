'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  TrendingUp,
  Search,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAdminCustomers, getCustomerStats } from '@/lib/api'
import type { CustomerListItem, CustomerStats } from '@/types/customer'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString('fa-IR') + ' تومان'
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Segment badge ────────────────────────────────────────────────────────────

const SEGMENT_LABEL: Record<string, string> = {
  VIP: 'VIP',
  REGULAR: 'معمولی',
  NEW: 'جدید',
  INACTIVE: 'غیرفعال',
}

const SEGMENT_CLASS: Record<string, string> = {
  VIP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  REGULAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  NEW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  INACTIVE: 'bg-muted text-muted-foreground',
}

function SegmentBadge({ segment }: { segment: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full', SEGMENT_CLASS[segment] ?? 'bg-muted text-muted-foreground')}>
      {SEGMENT_LABEL[segment] ?? segment}
    </span>
  )
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  colorClass: string
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'totalSpent' | 'lastOrderAt' | 'totalOrders'>('lastOrderAt')
  const [page, setPage] = useState(1)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset page on search change
  useEffect(() => { setPage(1) }, [debouncedSearch, sortBy])

  useEffect(() => {
    getCustomerStats().then(setStats).catch(() => null)
  }, [])

  useEffect(() => {
    setLoading(true)
    getAdminCustomers({ search: debouncedSearch || undefined, sortBy, sortOrder: 'desc', page, pageSize: 20 })
      .then((res) => {
        setCustomers(res.customers)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [debouncedSearch, sortBy, page])

  const sortOptions = [
    { value: 'lastOrderAt', label: 'آخرین سفارش' },
    { value: 'totalSpent', label: 'بیشترین خرید' },
    { value: 'totalOrders', label: 'تعداد سفارش' },
  ]

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">مشتریان</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت پروفایل مشتریان و تحلیل خریدها</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={Users} label="کل مشتریان" value={stats.totalCustomers.toLocaleString('fa-IR')} colorClass="bg-primary/10 text-primary" />
            <StatCard icon={UserPlus} label="جدید این ماه" value={stats.newThisMonth.toLocaleString('fa-IR')} colorClass="bg-emerald-500/10 text-emerald-600" />
            <StatCard icon={UserCheck} label="مشتریان VIP" value={stats.vipCustomers.toLocaleString('fa-IR')} colorClass="bg-purple-500/10 text-purple-600" />
            <StatCard icon={UserX} label="غیرفعال" value={stats.inactiveCustomers.toLocaleString('fa-IR')} colorClass="bg-muted text-muted-foreground" />
            <StatCard icon={TrendingUp} label="نرخ بازگشت" value={`٪${stats.returningRate}`} colorClass="bg-amber-500/10 text-amber-600" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="جستجو با نام یا شماره موبایل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 text-right"
                dir="rtl"
              />
            </div>
            <div className="flex gap-1 bg-muted rounded-xl p-1 shrink-0">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as typeof sortBy)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                    sortBy === opt.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              {debouncedSearch ? 'مشتری‌ای با این مشخصات یافت نشد.' : 'هنوز مشتری‌ای ثبت نشده است.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right text-muted-foreground font-medium px-5 py-3">نام</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3">موبایل</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3 hidden sm:table-cell">سفارش‌ها</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3 hidden md:table-cell">کل خرید</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3 hidden lg:table-cell">آخرین سفارش</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3">بخش</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs" dir="ltr">{c.phone}</td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{c.totalOrders.toLocaleString('fa-IR')}</td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell tabular-nums">{fmtPrice(c.totalSpent)}</td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs hidden lg:table-cell">{fmtDate(c.lastOrderAt)}</td>
                      <td className="px-4 py-3.5"><SegmentBadge segment={c.segment} /></td>
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/customers/${c.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                            پروفایل
                            <ChevronLeft className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10">
              <span className="text-xs text-muted-foreground">
                {total.toLocaleString('fa-IR')} مشتری
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {page.toLocaleString('fa-IR')} / {totalPages.toLocaleString('fa-IR')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
