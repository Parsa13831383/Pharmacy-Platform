'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import {
  getReportsSummary,
  getSalesOverview,
  getTopProducts,
  getLowStockReport,
  getOrderStatusReport,
  getRecentOrdersReport,
} from '@/lib/api'
import type {
  ReportsSummary,
  SalesDataPoint,
  TopProduct,
  LowStockItem,
  OrderStatusBreakdown,
  RecentOrder,
} from '@/types/reports'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  return n.toLocaleString('fa-IR') + ' تومان'
}

function fmtNum(n: number): string {
  return n.toLocaleString('fa-IR')
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
  })
}

function fmtDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const ORDER_STATUS_FA: Record<string, string> = {
  PENDING: 'در انتظار',
  CONFIRMED: 'تایید شده',
  PREPARING: 'آماده‌سازی',
  SENT: 'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده',
}

const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  PREPARING: 'bg-amber-50 text-amber-700 border border-amber-200',
  SENT: 'bg-primary/10 text-primary',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-destructive/10 text-destructive',
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  highlight?: 'warn' | 'success' | 'default'
}) {
  const iconBg =
    highlight === 'warn'
      ? 'bg-amber-50'
      : highlight === 'success'
        ? 'bg-emerald-50'
        : 'bg-primary/10'
  const iconColor =
    highlight === 'warn'
      ? 'text-amber-600'
      : highlight === 'success'
        ? 'text-emerald-600'
        : 'text-primary'

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-xl ${className ?? ''}`} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SalesDays = 7 | 30 | 90

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportsSummary | null>(null)
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [orderStatus, setOrderStatus] = useState<OrderStatusBreakdown | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [salesDays, setSalesDays] = useState<SalesDays>(30)
  const [salesLoading, setSalesLoading] = useState(false)

  // Initial load — all sections in parallel
  useEffect(() => {
    Promise.all([
      getReportsSummary(),
      getSalesOverview(salesDays),
      getTopProducts(),
      getLowStockReport(),
      getOrderStatusReport(),
      getRecentOrdersReport(),
    ])
      .then(([s, sales, top, stock, status, recent]) => {
        setSummary(s)
        setSalesData(sales)
        setTopProducts(top)
        setLowStock(stock)
        setOrderStatus(status)
        setRecentOrders(recent)
      })
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch only sales data when day selector changes
  useEffect(() => {
    if (loading) return
    setSalesLoading(true)
    getSalesOverview(salesDays)
      .then(setSalesData)
      .catch(() => {})
      .finally(() => setSalesLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesDays])

  if (pageError) {
    return (
      <AdminShell>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-6 text-sm">
          {pageError}
        </div>
      </AdminShell>
    )
  }

  // ─── Status counts for display ─────────────────────────────────────────────
  const statusCards = orderStatus
    ? [
        { label: 'در انتظار بررسی', value: orderStatus.pending, cls: ORDER_STATUS_CLASS.PENDING },
        { label: 'تایید شده', value: orderStatus.confirmed, cls: ORDER_STATUS_CLASS.CONFIRMED },
        { label: 'در حال آماده‌سازی', value: orderStatus.preparing, cls: ORDER_STATUS_CLASS.PREPARING },
        { label: 'ارسال شده', value: orderStatus.sent, cls: ORDER_STATUS_CLASS.SENT },
        { label: 'تحویل داده شده', value: orderStatus.delivered, cls: ORDER_STATUS_CLASS.DELIVERED },
        { label: 'لغو شده', value: orderStatus.cancelled, cls: ORDER_STATUS_CLASS.CANCELLED },
      ]
    : []

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" />
          گزارش‌ها و تحلیل فروش
        </h1>
        <p className="text-muted-foreground text-sm mt-1">نمای کلی عملکرد فروشگاه</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KpiCard
            icon={ShoppingBag}
            label="کل سفارشات"
            value={fmtNum(summary.totalOrders)}
          />
          <KpiCard
            icon={CheckCircle}
            label="تکمیل‌شده"
            value={fmtNum(summary.completedOrders)}
            highlight="success"
          />
          <KpiCard
            icon={TrendingUp}
            label="درآمد کل"
            value={fmtPrice(summary.totalRevenue)}
            sub="سفارش‌های تحویل‌داده‌شده"
          />
          <KpiCard
            icon={Package}
            label="محصولات فعال"
            value={fmtNum(summary.activeProducts)}
          />
          <KpiCard
            icon={AlertTriangle}
            label="کم‌موجود"
            value={fmtNum(summary.lowStockProducts)}
            highlight={summary.lowStockProducts > 0 ? 'warn' : 'default'}
          />
          <KpiCard
            icon={Clock}
            label="در انتظار"
            value={fmtNum(summary.pendingOrders)}
            highlight={summary.pendingOrders > 0 ? 'warn' : 'default'}
          />
        </div>
      )}

      {/* ── Sales chart ────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-foreground">روند درآمد</h2>
            <p className="text-muted-foreground text-xs mt-0.5">سفارش‌های تحویل‌داده‌شده</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {([7, 30, 90] as SalesDays[]).map(d => (
              <button
                key={d}
                onClick={() => setSalesDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  salesDays === d
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d} روز
              </button>
            ))}
          </div>
        </div>

        {loading || salesLoading ? (
          <Skeleton className="h-52 w-full" />
        ) : salesData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
            داده‌ای برای نمایش وجود ندارد.
          </div>
        ) : (
          <div className="h-52" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7fa882" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7fa882" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={fmtDate}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                    backgroundColor: 'hsl(var(--card))',
                  }}
                  formatter={(value: number) => [fmtPrice(value), 'درآمد']}
                  labelFormatter={fmtDate}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7fa882"
                  strokeWidth={2}
                  fill="url(#revenue-grad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Order status + Top products ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Order status breakdown */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">وضعیت سفارش‌ها</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {statusCards.map(({ label, value, cls }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2.5"
                >
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${cls}`}>
                    {fmtNum(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">پرفروش‌ترین محصولات</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              داده‌ای موجود نیست.
            </p>
          ) : (
            <div className="space-y-1">
              {topProducts.map((p, i) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 tabular-nums">
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.productNameSnapshot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtNum(p.totalQuantitySold)} عدد فروش
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary tabular-nums shrink-0">
                    {fmtPrice(p.revenueGenerated)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Low stock alert ─────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-amber-50/60">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <h2 className="font-semibold text-foreground">محصولات کم‌موجود</h2>
          {!loading && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {fmtNum(lowStock.length)} محصول
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : lowStock.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">تمام محصولات موجودی کافی دارند.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">نام محصول</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground hidden sm:table-cell">کد محصول</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">موجودی</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">حد هشدار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStock.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      {item.sku ? (
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {item.sku}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="tabular-nums font-bold text-amber-600">
                        {fmtNum(item.stockQuantity)}
                      </span>
                    </td>
                    <td className="px-6 py-3 tabular-nums text-muted-foreground">
                      {fmtNum(item.lowStockThreshold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent orders ────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">آخرین سفارش‌ها</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-muted-foreground text-sm">هیچ سفارشی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">شماره سفارش</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">مشتری</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">مبلغ</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">وضعیت</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground hidden lg:table-cell">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-foreground">{order.customerName}</td>
                    <td className="px-6 py-3.5 hidden md:table-cell tabular-nums text-muted-foreground">
                      {fmtPrice(Number(order.totalAmount))}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                          ORDER_STATUS_CLASS[order.orderStatus] ?? 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {ORDER_STATUS_FA[order.orderStatus] ?? order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">
                      {fmtDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
