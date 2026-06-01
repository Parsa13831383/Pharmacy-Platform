'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, HeadphonesIcon, PackageCheck, Shield, Sparkles, Truck } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard } from '@/components/public-product-card'
import { Button } from '@/components/ui/button'
import { getPublicProducts } from '@/lib/api'
import type { PublicProduct } from '@/types/public-product'

// ─── Static category cards ────────────────────────────────────────────────────

const CATEGORY_CARDS = [
  {
    slug: 'skincare',
    label: 'مراقبت پوست',
    emoji: '🌿',
    bg: 'from-emerald-50 to-teal-100',
    text: 'text-teal-700',
  },
  {
    slug: 'cosmetics',
    label: 'آرایشی',
    emoji: '✨',
    bg: 'from-rose-50 to-pink-100',
    text: 'text-pink-700',
  },
  {
    slug: 'supplements',
    label: 'مکمل‌ها',
    emoji: '💊',
    bg: 'from-amber-50 to-yellow-100',
    text: 'text-amber-700',
  },
  {
    slug: 'hygiene',
    label: 'بهداشتی',
    emoji: '🧴',
    bg: 'from-sky-50 to-blue-100',
    text: 'text-blue-700',
  },
]

const TRUST_ITEMS = [
  { icon: Truck, label: 'ارسال سریع', desc: 'به سراسر ایران' },
  { icon: Shield, label: 'خرید امن', desc: 'محصولات اصل و تضمینی' },
  { icon: HeadphonesIcon, label: 'پشتیبانی داروخانه', desc: 'راهنمایی متخصصین' },
  { icon: PackageCheck, label: 'موجودی به‌روز', desc: 'بروزرسانی لحظه‌ای' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState<PublicProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    getPublicProducts({ sort: 'newest' })
      .then(data => setLatestProducts(data.slice(0, 6)))
      .catch(() => {/* silently hide section on error */})
      .finally(() => setProductsLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-secondary/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
              className="max-w-2xl space-y-7"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
                <Sparkles className="w-4 h-4" />
                <span>محصولات اصل با ضمانت اصالت</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                خرید آسان محصولات
                <br />
                <span className="text-primary">داروخانه‌ای و مراقبتی</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                محصولات آرایشی، بهداشتی و مکمل‌ها را ساده، سریع و مطمئن سفارش دهید.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 gap-2"
                  >
                    مشاهده محصولات
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/products?category=skincare">
                  <Button size="lg" variant="outline" className="rounded-xl px-8">
                    مراقبت پوست
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Subtle decorative blob */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(107,158,107,0.12) 0%, transparent 70%)',
              filter: 'blur(60px)',
              width: 500,
              height: 500,
            }}
          />
        </section>

        {/* ── Trust bar ─────────────────────────────────────────────────────── */}
        <section className="py-10 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {TRUST_ITEMS.map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{label}</p>
                    <p className="text-muted-foreground text-xs">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category cards ────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                دسته‌بندی محصولات
              </h2>
              <p className="text-muted-foreground">
                محصول مناسب خود را سریع‌تر پیدا کنید
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORY_CARDS.map(({ slug, label, emoji, bg, text }, i) => (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={`/products?category=${slug}`}
                    className={`group block rounded-2xl bg-linear-to-br ${bg} p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300`}
                  >
                    <div className="text-3xl mb-3">{emoji}</div>
                    <h3 className={`font-bold text-base ${text}`}>{label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 group-hover:text-current transition-colors">
                      مشاهده محصولات
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Latest products ───────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  جدیدترین محصولات
                </h2>
                <p className="text-muted-foreground">تازه‌ترین اضافه‌شده‌ها به فروشگاه</p>
              </div>
              <Link href="/products?sort=newest" className="hidden sm:block">
                <Button variant="outline" className="rounded-xl gap-2">
                  مشاهده همه
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl border border-border/40 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-4/3 bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-4/5" />
                      <div className="h-4 bg-muted rounded w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {latestProducts.map((product, i) => (
                  <PublicProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : null}

            <div className="mt-8 text-center sm:hidden">
              <Link href="/products">
                <Button variant="outline" className="rounded-xl">
                  مشاهده همه محصولات
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary rounded-3xl p-10 md:p-16 text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                همین حالا خرید کنید
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 leading-relaxed">
                بیش از صدها محصول آرایشی، بهداشتی و دارویی با ضمانت اصالت و ارسال سریع در
                داروخانه سبز.
              </p>
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-xl px-10 font-semibold"
                >
                  مشاهده محصولات
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
