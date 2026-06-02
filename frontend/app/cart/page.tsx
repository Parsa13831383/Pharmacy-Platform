'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Leaf, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' تومان'
}

const SHIPPING_THRESHOLD = 500_000
const SHIPPING_COST = 50_000

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, totalItems } = useCart()

  const shippingCost = totalAmount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal = totalAmount + shippingCost

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <section className="bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 py-8 md:py-12 border-b border-slate-100">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground transition-colors">
                خانه
              </Link>
              <ArrowRight className="w-3 h-3" />
              <span className="text-foreground">سبد خرید</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              سبد خرید
              {totalItems > 0 && (
                <span className="mr-2 text-lg font-normal text-muted-foreground">
                  ({totalItems.toLocaleString('fa-IR')} عدد)
                </span>
              )}
            </h1>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {items.length === 0 ? (
              /* ── Empty state ── */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-primary/40" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">سبد خرید خالی است</h2>
                <p className="text-muted-foreground mb-8 text-sm">
                  محصولات مورد نظر خود را به سبد خرید اضافه کنید
                </p>
                <Link href="/products">
                  <Button className="rounded-xl px-8">مشاهده محصولات</Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* ── Cart items ── */}
                <div className="lg:col-span-2 space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -80 }}
                        transition={{ duration: 0.25 }}
                        className="bg-card rounded-2xl border border-border p-4 md:p-5"
                      >
                        <div className="flex gap-4">
                          {/* Placeholder thumbnail */}
                          <Link
                            href={`/products/${item.slug}`}
                            className="shrink-0 w-20 h-20 rounded-xl bg-linear-to-br from-primary/5 to-primary/15 flex items-center justify-center"
                          >
                            <Leaf className="w-7 h-7 text-primary/25" strokeWidth={1.5} />
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {item.categoryName && (
                                  <p className="text-xs text-muted-foreground mb-0.5">
                                    {item.categoryName}
                                  </p>
                                )}
                                <Link href={`/products/${item.slug}`}>
                                  <h3 className="font-medium text-foreground hover:text-primary transition-colors text-sm line-clamp-2">
                                    {item.name}
                                  </h3>
                                </Link>
                                {item.brand && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {item.brand}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                                aria-label="حذف از سبد"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {/* Quantity */}
                              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card transition-colors"
                                  aria-label="کاهش تعداد"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium tabular-nums">
                                  {item.quantity.toLocaleString('fa-IR')}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card transition-colors disabled:opacity-40"
                                  aria-label="افزایش تعداد"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="font-bold text-foreground text-sm">
                                  {fmtPrice(item.price * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    هر عدد {fmtPrice(item.price)}
                                  </p>
                                )}
                                {item.originalPrice != null && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {fmtPrice(item.originalPrice * item.quantity)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* ── Order summary ── */}
                <div className="lg:col-span-1">
                  <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                    <h2 className="font-bold text-foreground mb-5">خلاصه سفارش</h2>

                    <div className="space-y-3 mb-5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تعداد اقلام</span>
                        <span>{totalItems.toLocaleString('fa-IR')} عدد</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">جمع سبد</span>
                        <span>{fmtPrice(totalAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">هزینه ارسال</span>
                        <span className={shippingCost === 0 ? 'text-primary font-medium' : ''}>
                          {shippingCost === 0 ? 'رایگان' : fmtPrice(shippingCost)}
                        </span>
                      </div>
                      {shippingCost > 0 && (
                        <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                          با خرید بالای {fmtPrice(SHIPPING_THRESHOLD)} ارسال رایگان می‌شود.
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 mb-5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-foreground">جمع کل</span>
                        <span className="text-lg">{fmtPrice(finalTotal)}</span>
                      </div>
                    </div>

                    <Link href="/checkout" className="block">
                      <Button
                        className="w-full rounded-xl h-11 gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                        size="lg"
                      >
                        ادامه ثبت سفارش
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Link href="/products" className="block mt-3">
                      <Button variant="outline" className="w-full rounded-xl">
                        ادامه خرید از فروشگاه
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
