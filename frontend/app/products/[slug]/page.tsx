'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Leaf, Minus, Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard, fmtPrice } from '@/components/public-product-card'
import { Button } from '@/components/ui/button'
import { getPublicProductBySlug, getPublicProducts } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import type { PublicProduct } from '@/types/public-product'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockBadge(qty: number, threshold: number) {
  if (qty === 0) return { text: 'ناموجود', cls: 'bg-destructive/10 text-destructive' }
  if (qty <= threshold) return { text: 'تعداد محدود', cls: 'bg-amber-50 text-amber-700 border border-amber-200' }
  return { text: 'موجود', cls: 'bg-primary/10 text-primary' }
}

const GRADIENT_BY_SLUG: Record<string, string> = {
  skincare: 'from-emerald-50 to-teal-100',
  cosmetics: 'from-rose-50 to-pink-100',
  supplements: 'from-amber-50 to-yellow-100',
  hygiene: 'from-sky-50 to-blue-100',
  'hair-care': 'from-violet-50 to-purple-100',
  perfumes: 'from-fuchsia-50 to-pink-100',
}

function gradientFor(slug: string | null | undefined) {
  return (slug && GRADIENT_BY_SLUG[slug]) ?? 'from-primary/5 to-primary/15'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()

  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [related, setRelated] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    setAdded(false)
    setQuantity(1)

    getPublicProductBySlug(slug)
      .then(p => {
        setProduct(p)
        // Fetch related: same category, newest, exclude self
        const catSlug = p.category?.slug
        getPublicProducts({ sort: 'newest', ...(catSlug ? { category: catSlug } : {}) })
          .then(all => setRelated(all.filter(r => r.id !== p.id).slice(0, 4)))
          .catch(() => {/* related products are non-critical */})
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  function handleAdd() {
    if (!product || product.stockQuantity === 0) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  function adjustQty(delta: number) {
    if (!product) return
    setQuantity(q => Math.min(Math.max(1, q + delta), product.stockQuantity || 1))
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-6 pb-2">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              خانه
            </Link>
            <ArrowRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">
              محصولات
            </Link>
            {product && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className="text-foreground">{product.name}</span>
              </>
            )}
          </nav>
        </div>

        {loading ? (
          <div className="container mx-auto px-4 py-20 flex items-center justify-center text-muted-foreground gap-3">
            <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
              بازگشت
            </Button>
          </div>
        ) : !product ? null : (
          <>
            {/* ── Product section ───────────────────────────────────────────── */}
            <section className="container mx-auto px-4 py-8 md:py-12">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
                {/* Image placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`aspect-square rounded-3xl bg-linear-to-br ${gradientFor(product.category?.slug)} flex items-center justify-center`}
                >
                  <Leaf
                    className="w-24 h-24 text-primary/20"
                    strokeWidth={1}
                  />
                </motion.div>

                {/* Product info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Category + brand */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.category && (
                      <Link
                        href={`/products?category=${product.category.slug}`}
                        className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {product.category.name}
                      </Link>
                    )}
                    {product.brand && (
                      <span className="text-sm text-muted-foreground">{product.brand}</span>
                    )}
                  </div>

                  {/* Name */}
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
                    {product.name}
                  </h1>

                  {/* Stock badge */}
                  {(() => {
                    const s = stockBadge(product.stockQuantity, product.lowStockThreshold)
                    return (
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${s.cls}`}>
                        {s.text}
                      </span>
                    )
                  })()}

                  {/* Price */}
                  <div className="space-y-1">
                    {product.discountedPrice ? (
                      <>
                        <p className="text-3xl font-bold text-foreground">
                          {fmtPrice(product.discountedPrice)}
                        </p>
                        <p className="text-sm text-muted-foreground line-through">
                          {fmtPrice(product.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">
                        {fmtPrice(product.price)}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {product.description}
                    </p>
                  )}

                  {/* SKU */}
                  {product.sku && (
                    <p className="text-xs text-muted-foreground">
                      کد محصول:{' '}
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{product.sku}</span>
                    </p>
                  )}

                  {/* Quantity + Add to cart */}
                  {product.stockQuantity > 0 && (
                    <div className="flex items-center gap-4 pt-2">
                      {/* Quantity selector */}
                      <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                        <button
                          onClick={() => adjustQty(-1)}
                          disabled={quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-card transition-colors disabled:opacity-40"
                          aria-label="کاهش تعداد"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-medium text-sm tabular-nums">
                          {quantity.toLocaleString('fa-IR')}
                        </span>
                        <button
                          onClick={() => adjustQty(1)}
                          disabled={quantity >= product.stockQuantity}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-card transition-colors disabled:opacity-40"
                          aria-label="افزایش تعداد"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add button */}
                      <Button
                        onClick={handleAdd}
                        disabled={added}
                        className="flex-1 max-w-xs rounded-xl h-11 gap-2"
                      >
                        {added ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            افزوده شد
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            افزودن به سبد
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {product.stockQuantity === 0 && (
                    <Button disabled className="w-full max-w-xs rounded-xl h-11" variant="outline">
                      ناموجود
                    </Button>
                  )}

                  {/* Go to cart after adding */}
                  {added && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link href="/cart">
                        <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          مشاهده سبد خرید
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </section>

            {/* ── Related products ──────────────────────────────────────────── */}
            {related.length > 0 && (
              <section className="bg-secondary/20 py-12 md:py-16">
                <div className="container mx-auto px-4">
                  <h2 className="text-xl font-bold text-foreground mb-8">محصولات مرتبط</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {related.map((p, i) => (
                      <PublicProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
