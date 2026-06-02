'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  Truck,
  HeartPulse,
  FlaskConical,
  Pill,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard } from '@/components/public-product-card'
import { Button } from '@/components/ui/button'
import {
  getPublicProducts,
  getPublicPromotions,
  getFeaturedProducts,
  getFeaturedCategories,
  getHomepageSettings,
} from '@/lib/api'
import type { PublicProduct } from '@/types/public-product'
import type { PublicPromotion } from '@/types/promotion'
import type { HomepageSettings } from '@/types/cms'
import type { Category } from '@/types/category'
import { useRouter } from 'next/navigation'

// ─── Feature row items ────────────────────────────────────────────────────────

const FEATURE_ITEMS = [
  { icon: Pill, label: 'داروها', color: 'bg-blue-50 text-blue-600', slug: 'medicine' },
  { icon: HeartPulse, label: 'سلامت', color: 'bg-rose-50 text-rose-600', slug: 'wellness' },
  { icon: FlaskConical, label: 'تشخیصی', color: 'bg-purple-50 text-purple-600', slug: 'diagnostic' },
  { icon: Stethoscope, label: 'مراقبت', color: 'bg-emerald-50 text-emerald-600', slug: 'health' },
]

const TRUST_ITEMS = [
  { icon: Truck, label: 'ارسال سریع', desc: 'به سراسر ایران' },
  { icon: ShieldCheck, label: 'خرید امن', desc: 'محصولات اصل و تضمینی' },
  { icon: Phone, label: 'پشتیبانی', desc: 'راهنمایی متخصصین' },
  { icon: Pill, label: 'موجودی به‌روز', desc: 'بروزرسانی لحظه‌ای' },
]

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  skincare:     { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  cosmetics:    { bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'ring-rose-200' },
  supplements:  { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200' },
  hygiene:      { bg: 'bg-sky-50',     text: 'text-sky-700',     ring: 'ring-sky-200' },
  'hair-care':  { bg: 'bg-violet-50',  text: 'text-violet-700',  ring: 'ring-violet-200' },
  perfumes:     { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', ring: 'ring-fuchsia-200' },
}

const CATEGORY_EMOJIS: Record<string, string> = {
  skincare: '🌿', cosmetics: '✨', supplements: '💊',
  hygiene: '🧴', 'hair-care': '💇', perfumes: '🌸',
}

function categoryStyle(slug: string) {
  return CATEGORY_COLORS[slug] ?? { bg: 'bg-primary/5', text: 'text-primary', ring: 'ring-primary/20' }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [cms, setCms] = useState<HomepageSettings | null>(null)
  const [latestProducts, setLatestProducts] = useState<PublicProduct[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<PublicProduct[]>([])
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([])
  const [promotions, setPromotions] = useState<PublicPromotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getHomepageSettings(),
      getPublicProducts({ sort: 'newest' }),
      getFeaturedProducts(),
      getFeaturedCategories(),
      getPublicPromotions(),
    ]).then(([cmsRes, latestRes, featProdRes, featCatRes, promoRes]) => {
      if (cmsRes.status === 'fulfilled') setCms(cmsRes.value)
      if (latestRes.status === 'fulfilled') setLatestProducts(latestRes.value.slice(0, 6))
      if (featProdRes.status === 'fulfilled') setFeaturedProducts(featProdRes.value)
      if (featCatRes.status === 'fulfilled') setFeaturedCategories(featCatRes.value)
      if (promoRes.status === 'fulfilled') setPromotions(promoRes.value)
      setLoading(false)
    })
  }, [])

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`)
    else router.push('/products')
  }

  const heroEnabled = !cms || cms.isHeroEnabled
  const promoEnabled = !cms || cms.isPromoEnabled
  const featProdEnabled = !cms || cms.isFeaturedProductsEnabled
  const featCatEnabled = !cms || cms.isFeaturedCategoriesEnabled
  const aboutEnabled = !cms || cms.isAboutEnabled

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Header />

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        {heroEnabled && (
          <section className="relative bg-linear-to-br from-sky-50 via-cyan-50 to-blue-100 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24 relative">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-cyan-700 border border-cyan-200 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>محصولات اصل با ضمانت اصالت</span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight mb-4">
                    {cms?.heroTitle ?? 'خرید آسان محصولات داروخانه‌ای'}
                  </h1>

                  <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                    {cms?.heroSubtitle ?? 'محصولات آرایشی، بهداشتی و مکمل‌ها را ساده، سریع و مطمئن سفارش دهید.'}
                  </p>
                </motion.div>

                {/* Search bar */}
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="flex gap-2 bg-white rounded-2xl shadow-lg p-2 border border-white/60 max-w-lg mx-auto"
                >
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="جستجوی محصول، برند یا دسته‌بندی..."
                    className="flex-1 px-4 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    جستجو
                  </button>
                </motion.form>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="flex flex-wrap gap-3 justify-center"
                >
                  <Link href={cms?.heroButtonLink ?? '/products'}>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-7 gap-2 shadow-sm">
                      {cms?.heroButtonText ?? 'مشاهده محصولات'}
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/products?category=skincare">
                    <Button variant="outline" className="rounded-xl px-7 bg-white/80 border-slate-200 hover:bg-white">
                      مراقبت پوست
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ── Feature row ───────────────────────────────────────────────────── */}
        <section className="py-8 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
              {FEATURE_ITEMS.map(({ icon: Icon, label, color, slug }, i) => (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={`/products?category=${slug}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust bar ─────────────────────────────────────────────────────── */}
        <section className="py-8 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRUST_ITEMS.map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Promo banner ──────────────────────────────────────────────────── */}
        {promoEnabled && promotions.length > 0 && (
          <section className="py-10 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                <h2 className="font-bold text-lg text-slate-800">جشنواره‌های فعال</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4">
                {promotions.map((promo, i) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="shrink-0 md:shrink"
                  >
                    <Link
                      href={`/promotions/${promo.slug}`}
                      className="block bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 min-w-52 hover:shadow-lg transition-all duration-300 group"
                    >
                      <p className="font-bold text-white text-sm">{promo.title}</p>
                      {promo.bannerText && (
                        <p className="text-cyan-100 text-xs font-medium mt-1">{promo.bannerText}</p>
                      )}
                      {promo.description && (
                        <p className="text-white/70 text-xs mt-2 line-clamp-2">{promo.description}</p>
                      )}
                      <span className="text-xs text-white/80 mt-3 block group-hover:text-white transition-colors">
                        مشاهده محصولات ←
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Featured Categories ───────────────────────────────────────────── */}
        {featCatEnabled && featuredCategories.length > 0 && (
          <section className="py-12 bg-slate-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  <h2 className="font-bold text-lg text-slate-800">دسته‌بندی‌های محبوب</h2>
                </div>
                <Link href="/products" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  مشاهده همه
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {featuredCategories.map((cat, i) => {
                  const style = categoryStyle(cat.slug)
                  const emoji = CATEGORY_EMOJIS[cat.slug] ?? '🏥'
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`w-16 h-16 ${style.bg} ring-2 ${style.ring} rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          {emoji}
                        </div>
                        <span className={`text-xs font-medium ${style.text} text-center`}>{cat.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Featured Products ─────────────────────────────────────────────── */}
        {featProdEnabled && featuredProducts.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                    <h2 className="font-bold text-lg text-slate-800">محصولات ویژه</h2>
                  </div>
                  <p className="text-slate-400 text-sm pr-3">انتخاب‌های برتر داروخانه</p>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="rounded-xl gap-2 text-sm border-slate-200">
                    مشاهده همه
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.map((p, i) => (
                  <PublicProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Latest Products ───────────────────────────────────────────────── */}
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  <h2 className="font-bold text-lg text-slate-800">جدیدترین محصولات</h2>
                </div>
                <p className="text-slate-400 text-sm pr-3">تازه‌ترین اضافه‌شده‌ها</p>
              </div>
              <Link href="/products?sort=newest">
                <Button variant="outline" className="rounded-xl gap-2 text-sm border-slate-200">
                  مشاهده همه
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="aspect-4/3 bg-slate-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-4 bg-slate-100 rounded w-4/5" />
                      <div className="h-4 bg-slate-100 rounded w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {latestProducts.map((p, i) => (
                  <PublicProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <Pill className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">محصولی موجود نیست</p>
              </div>
            )}
          </div>
        </section>

        {/* ── About Section ─────────────────────────────────────────────────── */}
        {aboutEnabled && cms && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  <h2 className="font-bold text-lg text-slate-800">{cms.aboutTitle}</h2>
                </div>
                <p className="text-slate-500 leading-relaxed">{cms.aboutDescription}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Contact / CTA ─────────────────────────────────────────────────── */}
        <section className="py-12 bg-linear-to-br from-cyan-600 to-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              همین حالا خرید کنید
            </h2>
            <p className="text-cyan-100 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
              بیش از صدها محصول آرایشی، بهداشتی و دارویی با ضمانت اصالت و ارسال سریع.
            </p>
            {cms?.contactPhone && (
              <p className="text-cyan-200 text-sm mb-4" dir="ltr">{cms.contactPhone}</p>
            )}
            <Link href="/products">
              <Button className="bg-white text-cyan-700 hover:bg-white/90 rounded-xl px-10 font-semibold shadow-sm">
                مشاهده محصولات
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
