'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  AlertTriangle, ArrowUpRight, BadgeCheck, BarChart2, Lightbulb, Package,
  ShoppingBag, TrendingDown, TrendingUp, Users, Zap,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import {
  getInsightsOverview,
  getInsightsRevenueTrend,
  getInsightsProducts,
  getInsightsCategories,
  getInsightsCustomers,
  getInsightsRecommendations,
} from '@/lib/api'
import type {
  InsightsOverview,
  RevenueTrendPoint,
  ProductInsights,
  CategoryInsightItem,
  CustomerInsights,
  Recommendation,
  CustomerSegment,
} from '@/types/insights'

// ─── Constants ────────────────────────────────────────────────────────────────

type Days = 7 | 30 | 90 | 0

const DAY_OPTIONS: { value: Days; label: string }[] = [
  { value: 7,  label: '۷ روز' },
  { value: 30, label: '۳۰ روز' },
  { value: 90, label: '۹۰ روز' },
  { value: 0,  label: 'همه' },
]

const SEGMENT_FA: Record<CustomerSegment, string> = {
  VIP: 'ویژه',
  REGULAR: 'عادی',
  NEW: 'جدید',
  INACTIVE: 'غیرفعال',
}

const SEGMENT_CLASS: Record<CustomerSegment, string> = {
  VIP: 'bg-amber-50 text-amber-700 border border-amber-200',
  REGULAR: 'bg-blue-50 text-blue-700 border border-blue-200',
  NEW: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  INACTIVE: 'bg-muted text-muted-foreground border border-border',
}

const CATEGORY_COLORS = ['#7FA882', '#5A9B7E', '#A3C4A8', '#4A7D6F', '#C4E0C0', '#3B6B5D']

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString('fa-IR')
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-xl ${className ?? ''}`} />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
      {children}
    </h2>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

// ─── Overview card ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  accent?: 'green' | 'amber' | 'red' | 'blue'
}) {
  const ring = {
    green: 'bg-emerald-50',
    amber: 'bg-amber-50',
    red:   'bg-destructive/10',
    blue:  'bg-primary/10',
  }[accent ?? 'blue'] ?? 'bg-primary/10'

  const color = {
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red:   'text-destructive',
    blue:  'text-primary',
  }[accent ?? 'blue'] ?? 'text-primary'

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 ${ring} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-muted-foreground text-sm leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({
  rank,
  imageUrl,
  name,
  qty,
  revenue,
  stock,
  lowStock,
}: {
  rank: number
  imageUrl: string | null
  name: string
  qty: number
  revenue: number
  stock: number
  lowStock: boolean
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3 text-muted-foreground text-sm tabular-nums w-8">{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-muted">
              <Image src={imageUrl} alt={name} width={36} height={36} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground line-clamp-1">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-foreground">{qty.toLocaleString('fa-IR')}</td>
      <td className="px-4 py-3 text-sm tabular-nums text-foreground hidden sm:table-cell">
        {fmtPrice(revenue)} <span className="text-muted-foreground text-xs">ت</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className={`text-sm tabular-nums font-medium ${lowStock ? 'text-destructive' : 'text-foreground'}`}>
          {stock.toLocaleString('fa-IR')}
          {lowStock && <span className="text-xs mr-1 text-destructive">(!)</span>}
        </span>
      </td>
    </tr>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-md text-sm" dir="rtl">
      <p className="text-muted-foreground text-xs mb-1">{label ? fmtShortDate(label) : ''}</p>
      <p className="font-semibold text-foreground tabular-nums">{fmtPrice(payload[0]?.value ?? 0)} تومان</p>
    </div>
  )
}

function CategoryTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-md text-sm" dir="rtl">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-semibold text-foreground tabular-nums">{fmtPrice(payload[0]?.value ?? 0)} تومان</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ProductTab = 'best' | 'slow' | 'lowstock'

export default function InsightsPage() {
  const [days, setDays] = useState<Days>(30)
  const [overview, setOverview]       = useState<InsightsOverview | null>(null)
  const [trend, setTrend]             = useState<RevenueTrendPoint[]>([])
  const [products, setProducts]       = useState<ProductInsights | null>(null)
  const [categories, setCategories]   = useState<CategoryInsightItem[]>([])
  const [customers, setCustomers]     = useState<CustomerInsights | null>(null)
  const [recs, setRecs]               = useState<Recommendation[]>([])
  const [loading, setLoading]         = useState(true)
  const [pageError, setPageError]     = useState('')
  const [productTab, setProductTab]   = useState<ProductTab>('best')

  const load = useCallback((d: Days) => {
    setLoading(true)
    setPageError('')
    Promise.all([
      getInsightsOverview(d),
      getInsightsRevenueTrend(d),
      getInsightsProducts(d),
      getInsightsCategories(d),
      getInsightsCustomers(d),
      getInsightsRecommendations(),
    ])
      .then(([ov, tr, pr, ca, cu, rc]) => {
        setOverview(ov)
        setTrend(tr)
        setProducts(pr)
        setCategories(ca)
        setCustomers(cu)
        setRecs(rc)
      })
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(days) }, [days, load])

  function handleDays(d: Days) {
    setDays(d)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* ── Header + date filter ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">بینش فروش</h1>
          <p className="text-muted-foreground text-sm mt-1">تحلیل هوشمند عملکرد کسب‌وکار</p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted rounded-xl p-1 self-start sm:self-auto">
          {DAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleDays(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                days === opt.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {pageError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-5 text-sm mb-6" dir="rtl">
          {pageError}
        </div>
      )}

      {/* ══ SECTION 1 — Overview cards ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8" dir="rtl">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : overview ? (
          <>
            <StatCard
              icon={TrendingUp}
              label="کل درآمد (همه زمان‌ها)"
              value={fmtPrice(overview.totalRevenue) + ' ت'}
              sub="فقط سفارشات تحویل‌داده‌شده"
              accent="green"
            />
            <StatCard
              icon={ArrowUpRight}
              label={`درآمد در ${DAY_OPTIONS.find(d => d.value === days)?.label}`}
              value={fmtPrice(overview.periodRevenue) + ' ت'}
              accent="green"
            />
            <StatCard
              icon={ShoppingBag}
              label={`سفارشات (${DAY_OPTIONS.find(d => d.value === days)?.label})`}
              value={overview.periodOrders.toLocaleString('fa-IR')}
              sub={`${overview.periodDelivered.toLocaleString('fa-IR')} تحویل‌شده`}
              accent="blue"
            />
            <StatCard
              icon={Zap}
              label="میانگین ارزش سفارش"
              value={fmtPrice(Math.round(overview.avgOrderValue)) + ' ت'}
              sub="سفارشات تحویل‌شده"
              accent="blue"
            />
            <StatCard
              icon={Users}
              label="نرخ بازگشت مشتری"
              value={overview.returningRate + '%'}
              sub="مشتریانی که بیش از ۱ بار خرید کرده‌اند"
              accent="green"
            />
            <StatCard
              icon={AlertTriangle}
              label="سفارشات در انتظار"
              value={overview.allPending.toLocaleString('fa-IR')}
              accent="amber"
            />
            <StatCard
              icon={BadgeCheck}
              label="سفارشات تحویل‌شده"
              value={overview.allDelivered.toLocaleString('fa-IR')}
              accent="green"
            />
            <StatCard
              icon={TrendingDown}
              label="سفارشات لغو‌شده"
              value={overview.allCancelled.toLocaleString('fa-IR')}
              accent="red"
            />
          </>
        ) : null}
      </div>

      {/* ══ SECTION 2 — Revenue Trend ═══════════════════════════════════════════ */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-8" dir="rtl">
        <SectionTitle><TrendingUp className="w-4 h-4 text-primary" /> روند درآمد (سفارشات تحویل‌شده)</SectionTitle>
        {loading ? (
          <Skeleton className="h-48" />
        ) : trend.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">داده‌ای برای نمایش وجود ندارد.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7FA882" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7FA882" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtShortDate}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={v => fmtPrice(v)}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7FA882"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#7FA882' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ══ SECTION 3/4/5 — Products ════════════════════════════════════════════ */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-8" dir="rtl">
        <SectionTitle><Package className="w-4 h-4 text-primary" /> محصولات</SectionTitle>

        {/* Tab bar */}
        <div className="flex gap-1 mb-4 border-b border-border">
          {([
            { id: 'best',     label: 'پرفروش‌ترین' },
            { id: 'slow',     label: 'کم‌فروش' },
            { id: 'lowstock', label: 'موجودی کم + تقاضای بالا' },
          ] as { id: ProductTab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setProductTab(t.id)}
              className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors -mb-px ${
                productTab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Skeleton className="h-48" />
        ) : !products ? null : (
          <>
            {/* Best sellers */}
            {productTab === 'best' && (
              products.bestSellers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-10">هنوز سفارشی ثبت نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="px-4 py-2.5 text-right font-medium w-8">#</th>
                        <th className="px-4 py-2.5 text-right font-medium">محصول</th>
                        <th className="px-4 py-2.5 text-right font-medium">تعداد فروش</th>
                        <th className="px-4 py-2.5 text-right font-medium hidden sm:table-cell">درآمد (ت)</th>
                        <th className="px-4 py-2.5 text-right font-medium hidden md:table-cell">موجودی</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.bestSellers.map((p, i) => (
                        <ProductRow
                          key={p.productId}
                          rank={i + 1}
                          imageUrl={p.imageUrl}
                          name={p.name}
                          qty={p.quantitySold}
                          revenue={p.revenue}
                          stock={p.currentStock}
                          lowStock={p.lowStock}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Slow moving */}
            {productTab === 'slow' && (
              products.slowMoving.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-10">همه محصولات فعال هستند.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[440px]">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="px-4 py-2.5 text-right font-medium">محصول</th>
                        <th className="px-4 py-2.5 text-right font-medium">موجودی</th>
                        <th className="px-4 py-2.5 text-right font-medium">کل فروش</th>
                        <th className="px-4 py-2.5 text-right font-medium hidden sm:table-cell">پیشنهاد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slowMoving.map(p => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                                  <Image src={p.imageUrl} alt={p.name} width={32} height={32} className="object-cover w-full h-full" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-foreground line-clamp-1">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 tabular-nums">{p.stockQuantity.toLocaleString('fa-IR')}</td>
                          <td className="px-4 py-3 tabular-nums text-muted-foreground">{p.totalSold.toLocaleString('fa-IR')}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200">تبلیغ پیشنهادی</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* High demand low stock */}
            {productTab === 'lowstock' && (
              products.highDemandLowStock.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-10">محصولی با موجودی بحرانی یافت نشد.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="px-4 py-2.5 text-right font-medium">محصول</th>
                        <th className="px-4 py-2.5 text-right font-medium">تعداد فروش</th>
                        <th className="px-4 py-2.5 text-right font-medium hidden sm:table-cell">درآمد</th>
                        <th className="px-4 py-2.5 text-right font-medium">موجودی</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.highDemandLowStock.map(p => (
                        <tr key={p.productId} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                                  <Image src={p.imageUrl} alt={p.name} width={32} height={32} className="object-cover w-full h-full" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-foreground line-clamp-1">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 tabular-nums">{p.quantitySold.toLocaleString('fa-IR')}</td>
                          <td className="px-4 py-3 tabular-nums hidden sm:table-cell">{fmtPrice(p.revenue)} ت</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-destructive/10 text-destructive border border-destructive/20">
                              {p.currentStock.toLocaleString('fa-IR')} عدد
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* ══ SECTION 6 — Category Performance ═══════════════════════════════════ */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-8" dir="rtl">
        <SectionTitle><BarChart2 className="w-4 h-4 text-primary" /> عملکرد دسته‌بندی‌ها</SectionTitle>
        {loading ? (
          <Skeleton className="h-48" />
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-10">داده‌ای وجود ندارد.</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categories.slice(0, 6)}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => fmtPrice(v)}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {categories.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 text-right font-medium">دسته‌بندی</th>
                    <th className="py-2 text-right font-medium">درآمد (ت)</th>
                    <th className="py-2 text-right font-medium hidden sm:table-cell">تعداد سفارش</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.categoryId} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="py-2.5 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        {c.name}
                      </td>
                      <td className="py-2.5 tabular-nums font-medium">{fmtPrice(c.revenue)}</td>
                      <td className="py-2.5 tabular-nums text-muted-foreground hidden sm:table-cell">
                        {c.orders.toLocaleString('fa-IR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══ SECTION 7 — Customer Insights ═══════════════════════════════════════ */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-8" dir="rtl">
        <SectionTitle><Users className="w-4 h-4 text-primary" /> بینش مشتریان</SectionTitle>

        {loading ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
            <Skeleton className="h-48" />
          </>
        ) : customers ? (
          <>
            {/* Customer stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'کل مشتریان', value: customers.total, accent: 'blue' as const },
                { label: 'جدید این دوره', value: customers.newThisPeriod, accent: 'green' as const },
                { label: 'مشتریان ویژه', value: customers.vip, accent: 'amber' as const },
                { label: 'غیرفعال', value: customers.inactive, accent: 'red' as const },
              ].map(({ label, value, accent }) => (
                <div key={label} className="bg-muted/30 rounded-xl border border-border p-4">
                  <p className="text-muted-foreground text-xs mb-1.5">{label}</p>
                  <p className={`text-xl font-bold tabular-nums ${
                    accent === 'green' ? 'text-emerald-600'
                    : accent === 'amber' ? 'text-amber-600'
                    : accent === 'red' ? 'text-destructive'
                    : 'text-foreground'
                  }`}>
                    {value.toLocaleString('fa-IR')}
                  </p>
                </div>
              ))}
            </div>

            {/* Top 10 table */}
            <p className="text-sm font-medium text-foreground mb-3">۱۰ مشتری برتر (بیشترین خرید)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-2.5 text-right font-medium">#</th>
                    <th className="px-3 py-2.5 text-right font-medium">نام</th>
                    <th className="px-3 py-2.5 text-right font-medium hidden sm:table-cell">تلفن</th>
                    <th className="px-3 py-2.5 text-right font-medium">سفارشات</th>
                    <th className="px-3 py-2.5 text-right font-medium">جمع خرید (ت)</th>
                    <th className="px-3 py-2.5 text-right font-medium hidden md:table-cell">آخرین خرید</th>
                    <th className="px-3 py-2.5 text-right font-medium hidden lg:table-cell">سطح</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.top10.map((c, i) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-3 text-muted-foreground tabular-nums">{(i + 1).toLocaleString('fa-IR')}</td>
                      <td className="px-3 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-3 py-3 text-muted-foreground tabular-nums hidden sm:table-cell" dir="ltr">{c.phone}</td>
                      <td className="px-3 py-3 tabular-nums">{c.totalOrders.toLocaleString('fa-IR')}</td>
                      <td className="px-3 py-3 tabular-nums font-medium">{fmtPrice(c.totalSpent)}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {fmtDateTime(c.lastOrderAt)}
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <Badge className={SEGMENT_CLASS[c.segment]}>{SEGMENT_FA[c.segment]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>

      {/* ══ SECTION 8 — Recommendations ════════════════════════════════════════ */}
      {!loading && recs.length > 0 && (
        <div className="mb-8" dir="rtl">
          <SectionTitle><Lightbulb className="w-4 h-4 text-amber-500" /> توصیه‌های هوشمند</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-3">
            {recs.map((r, i) => {
              const bg =
                r.type === 'warning' ? 'bg-amber-50 border-amber-200'
                : r.type === 'success' ? 'bg-emerald-50 border-emerald-200'
                : 'bg-primary/5 border-primary/20'
              const iconColor =
                r.type === 'warning' ? 'text-amber-500'
                : r.type === 'success' ? 'text-emerald-600'
                : 'text-primary'
              const Icon =
                r.type === 'warning' ? AlertTriangle
                : r.type === 'success' ? TrendingUp
                : Lightbulb
              return (
                <div key={i} className={`rounded-2xl border p-4 flex gap-3 ${bg}`}>
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AdminShell>
  )
}

