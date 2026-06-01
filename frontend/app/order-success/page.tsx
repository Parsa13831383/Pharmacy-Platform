'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Home, Package, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

// ─── Inner component (uses useSearchParams — wrapped in Suspense) ─────────────

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') ?? ''

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg w-full"
        >
          {/* Success card */}
          <div className="bg-card rounded-3xl border border-border p-8 md:p-12 text-center shadow-sm">
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
            >
              سفارش شما ثبت شد!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-muted-foreground leading-relaxed mb-8"
            >
              سفارش شما با موفقیت ثبت شد و در حال پردازش است.
              <br />
              در اسرع وقت با شما تماس گرفته خواهد شد.
            </motion.p>

            {/* Order number */}
            {orderNumber && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-secondary/50 rounded-2xl px-6 py-5 mb-8"
              >
                <p className="text-muted-foreground text-sm mb-2 flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" />
                  شماره سفارش شما
                </p>
                <p className="font-mono font-bold text-xl text-primary tracking-wider">
                  {orderNumber}
                </p>
                <p className="text-muted-foreground text-xs mt-3">
                  این شماره را برای پیگیری سفارش نگه دارید.
                </p>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {orderNumber && (
                <Link href={`/track-order?orderNumber=${encodeURIComponent(orderNumber)}`}>
                  <Button className="w-full sm:w-auto rounded-xl gap-2">
                    <Package className="w-4 h-4" />
                    پیگیری سفارش
                  </Button>
                </Link>
              )}
              <Link href="/products">
                <Button variant="outline" className="w-full sm:w-auto rounded-xl gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  ادامه خرید
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full sm:w-auto rounded-xl gap-2 text-muted-foreground">
                  <Home className="w-4 h-4" />
                  خانه
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function OrderSuccessPage() {
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
      <OrderSuccessContent />
    </Suspense>
  )
}
