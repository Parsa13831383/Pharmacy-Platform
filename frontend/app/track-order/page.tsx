'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Package, Search, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getPublicOrderByNumber } from '@/lib/api'
import type { OrderStatus, PublicOrder } from '@/types/order'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'در انتظار بررسی',
  CONFIRMED: 'تایید شده',
  PREPARING: 'در حال آماده‌سازی',
  SENT: 'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده',
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  PREPARING: 'bg-amber-50 text-amber-700 border border-amber-200',
  SENT: 'bg-primary/10 text-primary',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-destructive/10 text-destructive',
}

// Progress steps — CANCELLED is handled separately
const PROGRESS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'ثبت سفارش' },
  { status: 'CONFIRMED', label: 'تایید سفارش' },
  { status: 'PREPARING', label: 'آماده‌سازی' },
  { status: 'SENT', label: 'ارسال' },
  { status: 'DELIVERED', label: 'تحویل' },
]

const PROGRESS_STATUS_INDEX: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  SENT: 3,
  DELIVERED: 4,
}

function fmtDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Progress Timeline ────────────────────────────────────────────────────────

function ProgressTimeline({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 bg-destructive/8 rounded-2xl p-4">
        <XCircle className="w-8 h-8 text-destructive shrink-0" />
        <div>
          <p className="font-semibold text-destructive">سفارش لغو شده</p>
          <p className="text-muted-foreground text-sm mt-0.5">
            این سفارش لغو شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    )
  }

  const currentIdx = PROGRESS_STATUS_INDEX[status] ?? 0

  return (
    <div className="overflow-x-auto pb-2">
      {/* Horizontal timeline — RTL: step 1 on right, step 5 on left */}
      <div className="flex items-start min-w-[340px]" dir="rtl">
        {PROGRESS_STEPS.map((step, i) => {
          const isDone = i <= currentIdx
          const isCurrent = i === currentIdx
          const isLast = i === PROGRESS_STEPS.length - 1

          return (
            <div key={step.status} className="flex items-start flex-1">
              {/* Step node */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground border-2 border-border'
                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                >
                  {isDone ? (
                    isCurrent && status !== 'DELIVERED' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs text-center leading-snug max-w-[56px] ${
                    isDone ? 'text-foreground font-medium' : 'text-muted-foreground'
                  } ${isCurrent ? 'text-primary font-semibold' : ''}`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {!isLast && (
                <div
                  className={`flex-1 h-px mt-4 mx-1 transition-colors ${
                    i < currentIdx ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Order result card ────────────────────────────────────────────────────────

function OrderCard({ order }: { order: PublicOrder }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            شماره سفارش
          </p>
          <p className="font-mono font-bold text-base text-foreground tracking-wide">
            {order.orderNumber}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full ${STATUS_BADGE_CLASS[order.orderStatus]}`}
        >
          {STATUS_LABEL[order.orderStatus]}
        </span>
      </div>

      {/* Progress timeline */}
      <div className="px-6 py-5">
        <ProgressTimeline status={order.orderStatus} />
      </div>

      {/* Date */}
      <div className="px-6 pb-5">
        <p className="text-xs text-muted-foreground">
          تاریخ ثبت:{' '}
          <span className="font-medium text-foreground">{fmtDateTime(order.createdAt)}</span>
        </p>
      </div>
    </motion.div>
  )
}

// ─── Inner page (uses useSearchParams) ───────────────────────────────────────

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [input, setInput] = useState(searchParams.get('orderNumber') ?? '')
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorType, setErrorType] = useState<'notFound' | 'general' | null>(null)

  // Auto-fetch when orderNumber is in URL on mount
  const didAutoFetch = useRef(false)
  useEffect(() => {
    const num = searchParams.get('orderNumber')
    if (num && !didAutoFetch.current) {
      didAutoFetch.current = true
      fetchOrder(num)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchOrder(num: string) {
    const trimmed = num.trim()
    if (!trimmed) return
    setLoading(true)
    setOrder(null)
    setErrorType(null)
    try {
      const result = await getPublicOrderByNumber(trimmed)
      setOrder(result)
      // Sync URL without navigation
      const params = new URLSearchParams()
      params.set('orderNumber', trimmed)
      router.replace(`/track-order?${params.toString()}`, { scroll: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : ''
      setErrorType(msg.includes('not found') ? 'notFound' : 'general')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    fetchOrder(input)
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl mx-auto space-y-6">
            {/* Page heading */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                پیگیری سفارش
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                شماره سفارش خود را وارد کنید تا وضعیت سفارش را مشاهده کنید.
              </p>
            </motion.div>

            {/* Search card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  placeholder="مثلاً ORD-20260529-0001"
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    if (errorType) setErrorType(null)
                    if (order) setOrder(null)
                  }}
                  disabled={loading}
                  dir="ltr"
                  className="h-11 font-mono text-sm flex-1"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl h-11 gap-2 shrink-0"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loading ? 'در حال جستجو...' : 'پیگیری'}
                </Button>
              </form>
            </motion.div>

            {/* Result area */}
            <AnimatePresence mode="wait">
              {/* Error states */}
              {errorType && !loading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-2xl border px-5 py-4 text-sm ${
                    errorType === 'notFound'
                      ? 'bg-muted border-border text-muted-foreground'
                      : 'bg-destructive/10 border-destructive/20 text-destructive'
                  }`}
                >
                  {errorType === 'notFound'
                    ? 'سفارشی با این شماره پیدا نشد.'
                    : 'خطا در دریافت وضعیت سفارش. لطفاً دوباره تلاش کنید.'}
                </motion.div>
              )}

              {/* Order card */}
              {order && !loading && (
                <OrderCard key={order.orderNumber} order={order} />
              )}
            </AnimatePresence>

            {/* Help text */}
            {!order && !errorType && !loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-xs text-muted-foreground/70"
              >
                شماره سفارش در ایمیل تأیید یا صفحه موفقیت خرید موجود است.
              </motion.p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" dir="rtl">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  )
}
