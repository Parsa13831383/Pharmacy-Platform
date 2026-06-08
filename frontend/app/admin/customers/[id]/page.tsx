'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowRight,
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Package,
  Tag,
  FileText,
  Save,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { getAdminCustomerById, updateCustomerNotes } from '@/lib/api'
import type { CustomerProfileResponse, CustomerRecentEvent } from '@/types/customer'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString('fa-IR') + ' تومان'
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Segment badge ────────────────────────────────────────────────────────────

const SEGMENT_LABEL: Record<string, string> = {
  VIP: 'VIP',
  REGULAR: 'معمولی',
  NEW: 'مشتری جدید',
  INACTIVE: 'غیرفعال',
}

const SEGMENT_CLASS: Record<string, string> = {
  VIP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  REGULAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  NEW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  INACTIVE: 'bg-muted text-muted-foreground',
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'در انتظار',
  CONFIRMED: 'تأیید شده',
  PREPARING: 'در حال آماده‌سازی',
  SENT: 'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده',
}

const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  SENT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-destructive/10 text-destructive',
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  PRODUCT_VIEW:  'مشاهده',
  PRODUCT_CLICK: 'کلیک',
}

function EventRow({ event }: { event: CustomerRecentEvent }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 text-sm">
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full shrink-0',
        event.eventType === 'PRODUCT_VIEW'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      )}>
        {EVENT_TYPE_LABEL[event.eventType] ?? event.eventType}
      </span>
      <span className="flex-1 text-foreground line-clamp-1">{event.productName}</span>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {new Date(event.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params['id'] as string

  const [data, setData] = useState<CustomerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  useEffect(() => {
    setLoading(true)
    getAdminCustomerById(id)
      .then((res) => {
        setData(res)
        setNotes(res.customer.notes ?? '')
      })
      .catch(() => setError('خطا در بارگذاری پروفایل مشتری'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSaveNotes() {
    if (!data) return
    setSavingNotes(true)
    try {
      await updateCustomerNotes(id, notes || null)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch {
      // silent — user can retry
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </AdminShell>
    )
  }

  if (error || !data) {
    return (
      <AdminShell>
        <div className="text-center py-24 text-destructive text-sm">{error || 'مشتری یافت نشد'}</div>
      </AdminShell>
    )
  }

  const { customer, orders, topProducts, topCategories, recentEvents = [] } = data

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
              <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full', SEGMENT_CLASS[customer.segment] ?? '')}>
                {SEGMENT_LABEL[customer.segment] ?? customer.segment}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{customer.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: info + notes */}
          <div className="space-y-5">
            {/* Customer info */}
            <Section title="اطلاعات مشتری" icon={Phone}>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> موبایل</dt>
                  <dd className="font-mono text-xs" dir="ltr">{customer.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> اولین خرید</dt>
                  <dd>{fmtDate(customer.firstOrderAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> آخرین خرید</dt>
                  <dd>{fmtDate(customer.lastOrderAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> تعداد سفارش</dt>
                  <dd className="font-bold">{customer.totalOrders.toLocaleString('fa-IR')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> کل خرید</dt>
                  <dd className="font-bold text-primary tabular-nums">{fmtPrice(customer.totalSpent)}</dd>
                </div>
              </dl>
            </Section>

            {/* Category preferences */}
            {topCategories.length > 0 && (
              <Section title="دسته‌بندی‌های محبوب" icon={Tag}>
                <ul className="space-y-2">
                  {topCategories.map((cat) => (
                    <li key={cat.categoryId} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground text-xs">{cat.count.toLocaleString('fa-IR')} عدد</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Product preferences */}
            {topProducts.length > 0 && (
              <Section title="محصولات پرتکرار" icon={Package}>
                <ul className="space-y-2">
                  {topProducts.map((p) => (
                    <li key={p.productId} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground line-clamp-1 flex-1 ml-2">{p.name}</span>
                        <span className="text-muted-foreground text-xs shrink-0">{p.count.toLocaleString('fa-IR')} عدد</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Notes */}
            <Section title="یادداشت مدیر" icon={FileText}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="یادداشتی درباره این مشتری بنویسید..."
                className="w-full min-h-[100px] text-sm bg-background border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
                dir="rtl"
              />
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-2 gap-1.5"
              >
                {notesSaved ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> ذخیره شد</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> ذخیره یادداشت</>
                )}
              </Button>
            </Section>
          </div>

          {/* Right column: events + order history */}
          <div className="lg:col-span-2 space-y-5">
            {/* Recent activity */}
            {recentEvents.length > 0 && (
              <Section title="فعالیت‌های اخیر (مشاهده / کلیک)" icon={Activity}>
                <div className="max-h-64 overflow-y-auto">
                  {recentEvents.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </div>
              </Section>
            )}

            <Section title="تاریخچه سفارش‌ها" icon={ShoppingBag}>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">سفارشی یافت نشد.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{order.orderNumber}</span>
                          <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full', ORDER_STATUS_CLASS[order.orderStatus] ?? 'bg-muted text-muted-foreground')}>
                            {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm tabular-nums">{fmtPrice(order.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-right font-medium pb-1.5">محصول</th>
                            <th className="text-left font-medium pb-1.5">تعداد</th>
                            <th className="text-left font-medium pb-1.5">قیمت واحد</th>
                            <th className="text-left font-medium pb-1.5">جمع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-1 text-foreground line-clamp-1">{item.productName}</td>
                              <td className="py-1 text-right tabular-nums" dir="ltr">{item.quantity}</td>
                              <td className="py-1 text-right tabular-nums text-muted-foreground" dir="ltr">{item.unitPrice.toLocaleString('fa-IR')}</td>
                              <td className="py-1 text-right tabular-nums font-medium" dir="ltr">{item.totalPrice.toLocaleString('fa-IR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
