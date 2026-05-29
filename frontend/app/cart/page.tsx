'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()

  const shippingCost = totalPrice >= 500000 ? 0 : 50000
  const finalTotal = totalPrice + shippingCost

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary/30 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
              <ArrowRight className="w-3 h-3" />
              <span className="text-foreground">سبد خرید</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">سبد خرید</h1>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {items.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-card rounded-2xl p-4 md:p-6 shadow-sm"
                      >
                        <div className="flex gap-4 md:gap-6">
                          {/* Image */}
                          <Link href={`/product/${item.id}`} className="shrink-0">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-muted">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <span className="text-xs text-muted-foreground">{item.category}</span>
                                <Link href={`/product/${item.id}`}>
                                  <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                                    {item.name}
                                  </h3>
                                </Link>
                                <p className="text-xs text-muted-foreground mt-1">{item.nameEn}</p>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-end justify-between mt-4">
                              {/* Quantity */}
                              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-left">
                                <p className="font-bold text-foreground">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    هر عدد {formatPrice(item.price)}
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

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-card rounded-2xl p-6 shadow-sm sticky top-24">
                    <h2 className="font-bold text-lg text-foreground mb-6">خلاصه سفارش</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تعداد محصولات</span>
                        <span className="text-foreground">{totalItems} عدد</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">جمع سبد خرید</span>
                        <span className="text-foreground">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">هزینه ارسال</span>
                        <span className={shippingCost === 0 ? 'text-primary' : 'text-foreground'}>
                          {shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}
                        </span>
                      </div>
                      {shippingCost > 0 && (
                        <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                          با خرید بالای ۵۰۰,۰۰۰ تومان، ارسال رایگان است.
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">جمع کل</span>
                        <span className="font-bold text-xl text-foreground">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" size="lg">
                        ادامه خرید
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </Button>
                    </Link>

                    <Link href="/products" className="block mt-4">
                      <Button variant="outline" className="w-full rounded-xl">
                        ادامه خرید از فروشگاه
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Cart */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">سبد خرید خالی است</h2>
                <p className="text-muted-foreground mb-8">
                  محصولات مورد نظر خود را به سبد خرید اضافه کنید
                </p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8">
                    مشاهده محصولات
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
