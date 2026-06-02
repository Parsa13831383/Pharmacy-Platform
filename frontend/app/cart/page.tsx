'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Minus, Package, Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useCart } from '@/lib/cart-context'
import { getMediaUrl } from '@/lib/media'

const C = {
  bg:     '#F7F2E8',
  bg2:    '#EFE7DA',
  dark:   '#232323',
  muted:  '#6F6A61',
  border: '#E5DED1',
  green:  '#2F7A4D',
  cta:    '#C98267',
  ctaHov: '#B5704F',
  white:  '#FFFFFF',
}

function fmtPrice(n: number) {
  return n.toLocaleString('fa-IR') + ' تومان'
}

const SHIPPING_THRESHOLD = 500_000
const SHIPPING_COST      = 50_000

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, totalItems } = useCart()

  const shippingCost = totalAmount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal   = totalAmount + shippingCost

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }} dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div style={{ backgroundColor: C.bg2, borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
            <nav className="flex items-center gap-2 text-xs mb-3" style={{ color: C.muted }}>
              <Link href="/">خانه</Link>
              <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              <span style={{ color: C.dark }}>سبد خرید</span>
            </nav>
            <h1 className="text-2xl font-bold" style={{ color: C.dark, letterSpacing: '-0.02em' }}>
              سبد خرید
              {totalItems > 0 && (
                <span className="mr-2 text-base font-normal" style={{ color: C.muted }}>
                  ({totalItems.toLocaleString('fa-IR')} عدد)
                </span>
              )}
            </h1>
          </div>
        </div>

        <section className="py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-28"
              >
                <div
                  className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6"
                  style={{ backgroundColor: C.bg2 }}
                >
                  <Package className="w-7 h-7" strokeWidth={1.5} style={{ color: C.muted }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: C.dark }}>سبد خرید خالی است</h2>
                <p className="text-sm mb-8" style={{ color: C.muted }}>
                  محصولات مورد نظر خود را به سبد خرید اضافه کنید
                </p>
                <Link href="/products">
                  <button
                    className="px-8 py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: C.cta, borderRadius: '3px' }}
                  >
                    مشاهده محصولات
                  </button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-10">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map(item => {
                      const hasImage = 'imageUrl' in item && item.imageUrl
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -60 }}
                          transition={{ duration: 0.22 }}
                          className="flex gap-4 p-4 md:p-5"
                          style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px' }}
                        >
                          {/* Thumbnail */}
                          <Link
                            href={`/products/${item.slug}`}
                            className="shrink-0 w-20 h-24 overflow-hidden"
                            style={{ borderRadius: '3px', background: 'linear-gradient(160deg, #D9CFC4 0%, #C8BFB2 100%)' }}
                          >
                            {hasImage ? (
                              <img
                                src={getMediaUrl((item as typeof item & { imageUrl: string }).imageUrl)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {item.categoryName && (
                                  <p className="text-[11px] tracking-editorial mb-1" style={{ color: C.muted }}>
                                    {item.categoryName}
                                  </p>
                                )}
                                <Link href={`/products/${item.slug}`}>
                                  <h3 className="text-sm font-medium line-clamp-2" style={{ color: C.dark }}>
                                    {item.name}
                                  </h3>
                                </Link>
                                {item.brand && (
                                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>{item.brand}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="shrink-0 p-1.5 rounded transition-colors"
                                style={{ color: C.muted }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C0392B' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.muted }}
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {/* Quantity */}
                              <div
                                className="flex items-center border"
                                style={{ borderColor: C.border, borderRadius: '3px' }}
                              >
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center transition-colors"
                                  style={{ color: C.dark, borderLeft: `1px solid ${C.border}` }}
                                >
                                  <Minus className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                                <span className="w-9 text-center text-sm font-medium tabular-nums" style={{ color: C.dark }}>
                                  {item.quantity.toLocaleString('fa-IR')}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                                  style={{ color: C.dark, borderRight: `1px solid ${C.border}` }}
                                >
                                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="text-sm font-semibold" style={{ color: C.dark }}>
                                  {fmtPrice(item.price * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-xs" style={{ color: C.muted }}>
                                    هر عدد {fmtPrice(item.price)}
                                  </p>
                                )}
                                {item.originalPrice != null && (
                                  <p className="text-xs line-through" style={{ color: C.muted }}>
                                    {fmtPrice(item.originalPrice * item.quantity)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                  <div
                    className="p-6 sticky top-24 space-y-5"
                    style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '4px' }}
                  >
                    <h2 className="font-semibold" style={{ color: C.dark }}>خلاصه سفارش</h2>

                    <div className="space-y-3 text-sm" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '1rem' }}>
                      <div className="flex justify-between">
                        <span style={{ color: C.muted }}>تعداد اقلام</span>
                        <span style={{ color: C.dark }}>{totalItems.toLocaleString('fa-IR')} عدد</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: C.muted }}>جمع سبد</span>
                        <span style={{ color: C.dark }}>{fmtPrice(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: C.muted }}>هزینه ارسال</span>
                        <span style={{ color: shippingCost === 0 ? C.green : C.dark }}>
                          {shippingCost === 0 ? 'رایگان' : fmtPrice(shippingCost)}
                        </span>
                      </div>
                      {shippingCost > 0 && (
                        <p className="text-xs" style={{ color: C.muted }}>
                          با خرید بالای {fmtPrice(SHIPPING_THRESHOLD)} ارسال رایگان
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span style={{ color: C.dark }}>جمع کل</span>
                      <span className="text-lg" style={{ color: C.dark }}>{fmtPrice(finalTotal)}</span>
                    </div>

                    <Link href="/checkout" className="block">
                      <button
                        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: C.cta, borderRadius: '3px' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.ctaHov }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.cta }}
                      >
                        ادامه ثبت سفارش
                        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </Link>

                    <Link href="/products" className="block">
                      <button
                        className="w-full py-3 text-sm border transition-colors"
                        style={{ borderColor: C.border, color: C.muted, borderRadius: '3px' }}
                      >
                        ادامه خرید
                      </button>
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
