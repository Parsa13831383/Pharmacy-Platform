'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { getPublicPromotionBySlug } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import type { PublicPromotion, PromotionProductItem } from '@/types/promotion'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(amount: string | number): string {
  return Number(amount).toLocaleString('fa-IR') + ' تومان'
}

function stockLabel(qty: number, threshold: number): { text: string; cls: string } {
  if (qty === 0) return { text: 'ناموجود', cls: 'bg-destructive/10 text-destructive' }
  if (qty <= threshold) return { text: 'تعداد محدود', cls: 'bg-amber-50 text-amber-700 border border-amber-200' }
  return { text: 'موجود', cls: 'bg-primary/10 text-primary' }
}

// ─── Promotion product card ───────────────────────────────────────────────────

function PromotionProductCard({
  item,
  index,
}: {
  item: PromotionProductItem
  index: number
}) {
  const { addItem } = useCart()
  const { product } = item
  const stock = stockLabel(product.stockQuantity, product.lowStockThreshold)
  const isOutOfStock = product.stockQuantity === 0
  const hasDiscount = product.discountedPrice != null

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (isOutOfStock) return
    // Build minimal PublicProduct shape for addItem
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountedPrice: product.discountedPrice,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        brand: product.brand,
        sku: null,
        description: null,
        isActive: product.isActive,
        categoryId: product.category?.id ?? null,
        category: product.category
          ? { ...product.category, description: null, isActive: true, createdAt: '', updatedAt: '' }
          : null,
        images: [],
        createdAt: '',
        updatedAt: '',
      },
      1,
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.4 }}
    >
      <Link href={`/products/${product.slug}`} className="group block h-full">
        <div className="bg-card rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full flex flex-col overflow-hidden">
          {/* Placeholder */}
          <div className="relative aspect-4/3 bg-linear-to-br from-primary/5 to-primary/15 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary/20 group-hover:text-primary/30 transition-colors duration-300" strokeWidth={1.5} />
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                تخفیف
              </span>
            )}
            <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${stock.cls}`}>
              {stock.text}
            </span>
          </div>

          <div className="p-4 flex flex-col flex-1 gap-2">
            {product.brand && (
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            )}
            <h3 className="font-medium text-foreground text-sm leading-relaxed line-clamp-2 flex-1">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 pt-1">
              {hasDiscount ? (
                <>
                  <span className="font-bold text-foreground text-sm">
                    {fmtPrice(product.discountedPrice!)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {fmtPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-foreground text-sm">{fmtPrice(product.price)}</span>
              )}
            </div>

            <Button
              onClick={handleAdd}
              disabled={isOutOfStock}
              size="sm"
              variant="outline"
              className="w-full rounded-xl mt-1 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
            >
              {isOutOfStock ? 'ناموجود' : 'افزودن به سبد'}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromotionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [promotion, setPromotion] = useState<PublicPromotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    getPublicPromotionBySlug(slug)
      .then(setPromotion)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-6 pb-2">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">خانه</Link>
            <ArrowRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">محصولات</Link>
            {promotion && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className="text-foreground">{promotion.title}</span>
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
        ) : !promotion ? null : (
          <>
            {/* Hero banner */}
            <section className="bg-linear-to-br from-primary/10 to-primary/5 border-b border-border py-10 md:py-14">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl"
                >
                  <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1.5 rounded-full text-xs font-medium mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    جشنواره ویژه
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {promotion.title}
                  </h1>
                  {promotion.bannerText && (
                    <p className="text-lg font-semibold text-primary mb-3">{promotion.bannerText}</p>
                  )}
                  {promotion.description && (
                    <p className="text-muted-foreground leading-relaxed">{promotion.description}</p>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Products grid */}
            <section className="py-12 md:py-16">
              <div className="container mx-auto px-4">
                {!promotion.products || promotion.products.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <p className="text-muted-foreground">محصولی در این جشنواره موجود نیست.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">
                      {promotion.products.length.toLocaleString('fa-IR')} محصول در این جشنواره
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {promotion.products.map((item, i) => (
                        <PromotionProductCard key={item.id} item={item} index={i} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
