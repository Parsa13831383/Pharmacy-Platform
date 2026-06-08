'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, Search } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAdminOrders } from '@/lib/api'
import type { OrderListItem, OrderStatus } from '@/types/order'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'در انتظار بررسی',
  CONFIRMED: 'تایید شده',
  PREPARING: 'در حال آماده‌سازی',
  SENT:      'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده',
}

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  PREPARING: 'bg-purple-50 text-purple-700 border border-purple-200',
  SENT:      'bg-primary/10 text-primary border border-primary/20',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-destructive/10 text-destructive border border-destructive/20',
}

const STATUS_FILTER_OPTIONS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',       label: 'همه' },
  { value: 'PENDING',   label: ORDER_STATUS_LABEL.PENDING },
  { value: 'CONFIRMED', label: ORDER_STATUS_LABEL.CONFIRMED },
  { value: 'PREPARING', label: ORDER_STATUS_LABEL.PREPARING },
  { value: 'SENT',      label: ORDER_STATUS_LABEL.SENT },
  { value: 'DELIVERED', label: ORDER_STATUS_LABEL.DELIVERED },
  { value: 'CANCELLED', label: ORDER_STATUS_LABEL.CANCELLED },
]

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function fmtPrice(amount: string | number) {
  return Number(amount).toLocaleString('fa-IR')
}

function truncate(str: string | null | undefined, max = 30) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAdminOrders()
      .then(data => setOrders(data ?? []))
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived stats (all orders, ignoring current filter) ───────────────────
  const total     = orders.length
  const pending   = orders.filter(o => o.orderStatus === 'PENDING').length
  const delivered = orders.filter(o => o.orderStatus === 'DELIVERED').length
  const cancelled = orders.filter(o => o.orderStatus === 'CANCELLED').length
  const revenue   = orders
    .filter(o => o.orderStatus === 'DELIVERED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  // ── Client-side filter ────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter
      const matchesSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q)
      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, search])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8" dir="rtl">
        <h1 className="text-2xl font-bold text-foreground">سفارش‌ها</h1>
        <p className="text-muted-foreground text-sm mt-1">پیگیری و مدیریت سفارشات مشتریان</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      ) : pageError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-6 text-sm" dir="rtl">
          {pageError}
        </div>
      ) : (
        <>
          {/* ── Summary cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8" dir="rtl">
            {[
              { label: 'کل سفارشات',      value: total.toLocaleString('fa-IR'),                              color: 'text-foreground' },
              { label: 'در انتظار',        value: pending.toLocaleString('fa-IR'),                            color: 'text-amber-600' },
              { label: 'تحویل داده شده',  value: delivered.toLocaleString('fa-IR'),                          color: 'text-emerald-600' },
              { label: 'لغو شده',          value: cancelled.toLocaleString('fa-IR'),                          color: 'text-destructive' },
              { label: 'درآمد تحویل‌ها',  value: fmtPrice(revenue) + ' تومان',                              color: 'text-primary',     span: true },
            ].map(({ label, value, color, span }) => (
              <div
                key={label}
                className={`bg-card rounded-2xl border border-border p-5 ${span ? 'lg:col-span-1 col-span-2' : ''}`}
              >
                <p className="text-muted-foreground text-xs mb-1.5">{label}</p>
                <p className={`text-xl font-bold tabular-nums leading-tight ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Filters row ────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5" dir="rtl">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="شماره سفارش، نام یا تلفن..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pr-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Orders table ───────────────────────────────────────────────── */}
          {displayed.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border" dir="rtl">
              <p className="text-muted-foreground text-sm">
                {orders.length === 0 ? 'هیچ سفارشی ثبت نشده است.' : 'نتیجه‌ای یافت نشد.'}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[780px]" dir="rtl">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground">شماره سفارش</th>
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground">مشتری</th>
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground hidden md:table-cell">تلفن</th>
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground hidden lg:table-cell">آدرس</th>
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground">وضعیت</th>
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground hidden sm:table-cell">مبلغ (تومان)</th>
                    <th className="text-right px-5 py-3.5 font-medium text-muted-foreground hidden xl:table-cell">تاریخ</th>
                    <th className="px-5 py-3.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayed.map(order => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground">
                        {order.customerName}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-muted-foreground tabular-nums" dir="ltr">
                        {order.customerPhone}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground text-xs max-w-[180px] truncate">
                        {truncate(order.deliveryAddress)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_CLASS[order.orderStatus]}`}>
                          {ORDER_STATUS_LABEL[order.orderStatus]}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell tabular-nums font-medium text-foreground">
                        {fmtPrice(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell text-muted-foreground text-xs">
                        {fmtDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground rounded-lg"
                            title="مشاهده جزئیات"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminShell>
  )
}
