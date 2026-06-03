'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Minus, Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard, fmtPrice } from '@/components/public-product-card'
import { getPublicProductBySlug, getPublicProducts } from '@/lib/api'
import { getMediaUrl } from '@/lib/media'
import { useCart } from '@/lib/cart-context'
import type { PublicProduct, PublicProductImage } from '@/types/public-product'

const C = {
  bg:     '#FAFAF8',
  bg2:    '#EFE7DA',
  dark:   '#232323',
  muted:  '#6F6A61',
  border: '#E5DED1',
  green:  '#2F7A4D',
  cta:    '#C98267',
  ctaHov: '#B5704F',
  white:  '#FFFFFF',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  skincare:    'linear-gradient(160deg, #D9CFC4 0%, #C8BFB2 100%)',
  cosmetics:   'linear-gradient(160deg, #DFD0CE 0%, #CEC0BE 100%)',
  supplements: 'linear-gradient(160deg, #D4D0C0 0%, #C4C0B0 100%)',
  hygiene:     'linear-gradient(160deg, #CDD6D8 0%, #BCC8CA 100%)',
  'hair-care': 'linear-gradient(160deg, #D0C8DE 0%, #C0B8CE 100%)',
}

function placeholderGradient(slug?: string | null) {
  return (slug && CATEGORY_GRADIENTS[slug]) ?? 'linear-gradient(160deg, #D9CFC4 0%, #C8BFB2 100%)'
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()

  const [product, setProduct]   = useState<PublicProduct | null>(null)
  const [related, setRelated]   = useState<PublicProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded]       = useState(false)
  const [selectedImg, setSelectedImg] = useState<PublicProductImage | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    setAdded(false)
    setQuantity(1)
    setSelectedImg(null)

    getPublicProductBySlug(slug)
      .then(p => {
        setProduct(p)
        const imgs = p.images ?? []
        setSelectedImg(imgs.find(i => i.isPrimary) ?? imgs[0] ?? null)
        const catSlug = p.category?.slug
        getPublicProducts({ sort: 'newest', ...(catSlug ? { category: catSlug } : {}) })
          .then(all => setRelated(all.filter(r => r.id !== p.id).slice(0, 4)))
          .catch(() => {})
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

  const productImages = product?.images ?? []
  const isOutOfStock  = (product?.stockQuantity ?? 0) === 0
  const hasDiscount   = product?.discountedPrice != null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }} dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div
          className="py-4"
          style={{ backgroundColor: C.bg2, borderBottom: `1px solid ${C.border}` }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <nav className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
              <Link href="/" className="transition-colors hover:text-[#232323]">خانه</Link>
              <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
              <Link href="/products" className="transition-colors hover:text-[#232323]">محصولات</Link>
              {product && (
                <>
                  <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                  <span style={{ color: C.dark }}>{product.name}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.border, borderTopColor: C.dark }} />
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 text-center">
            <p className="text-sm mb-4" style={{ color: C.muted }}>{error}</p>
            <button onClick={() => router.back()} className="text-sm underline" style={{ color: C.dark }}>بازگشت</button>
          </div>
        ) : !product ? null : (
          <>
            {/* Product section */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-20 pb-28 md:pb-20">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* Image gallery */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  {/* Main image */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      aspectRatio: '4/5',
                      background: placeholderGradient(product.category?.slug),
                      borderRadius: '4px',
                    }}
                  >
                    {/* Placeholder — always present; visible when no image or on error */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: placeholderGradient(product.category?.slug) }}
                    >
                      <div
                        className="w-20 h-20 rounded-full opacity-15"
                        style={{ backgroundColor: C.muted }}
                      />
                    </div>

                    {selectedImg && (
                      <img
                        src={getMediaUrl(selectedImg.imageUrl)}
                        alt={selectedImg.altText ?? product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}

                    {hasDiscount && (
                      <span
                        className="absolute top-4 right-4 text-xs px-2.5 py-1 font-medium text-white z-10"
                        style={{ backgroundColor: C.cta, borderRadius: '2px' }}
                      >
                        تخفیف
                      </span>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {productImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {productImages.map(img => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImg(img)}
                          className="shrink-0 w-16 h-16 overflow-hidden transition-all relative"
                          style={{
                            borderRadius: '3px',
                            background: placeholderGradient(product.category?.slug),
                            outline: selectedImg?.id === img.id ? `2px solid ${C.dark}` : `1px solid ${C.border}`,
                            outlineOffset: selectedImg?.id === img.id ? '2px' : '0',
                          }}
                        >
                          <img
                            src={getMediaUrl(img.imageUrl)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Product info */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  className="space-y-7 md:pt-4"
                >
                  {/* Category + brand */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {product.category && (
                      <Link
                        href={`/products?category=${product.category.slug}`}
                        className="text-[11px] tracking-editorial transition-colors"
                        style={{ color: C.green }}
                      >
                        {product.category.name}
                      </Link>
                    )}
                    {product.brand && (
                      <span className="text-xs" style={{ color: C.muted }}>— {product.brand}</span>
                    )}
                  </div>

                  {/* Name */}
                  <h1
                    className="text-2xl md:text-3xl font-bold leading-snug"
                    style={{ color: C.dark, letterSpacing: '-0.02em' }}
                  >
                    {product.name}
                  </h1>

                  {/* Stock indicator */}
                  <div>
                    {isOutOfStock ? (
                      <span className="text-xs tracking-editorial" style={{ color: C.muted }}>ناموجود</span>
                    ) : product.stockQuantity <= product.lowStockThreshold ? (
                      <span className="text-xs" style={{ color: C.cta }}>تعداد محدود</span>
                    ) : (
                      <span className="text-xs" style={{ color: C.green }}>موجود</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-1 py-2" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold" style={{ color: C.dark }}>
                          {fmtPrice(product.discountedPrice!)}
                        </span>
                        <span className="text-sm line-through" style={{ color: C.muted }}>
                          {fmtPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: C.dark }}>
                        {fmtPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                      {product.description}
                    </p>
                  )}

                  {/* SKU */}
                  {product.sku && (
                    <p className="text-xs" style={{ color: C.muted }}>
                      کد: <span dir="ltr" className="font-mono">{product.sku}</span>
                    </p>
                  )}

                  {/* Quantity + CTA */}
                  {!isOutOfStock ? (
                    <div className="space-y-4">
                      {/* Qty selector */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center gap-0 border"
                          style={{ borderColor: C.border, borderRadius: '3px', width: 'fit-content' }}
                        >
                          <button
                            onClick={() => adjustQty(-1)}
                            disabled={quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-30"
                            style={{ color: C.dark, borderLeft: `1px solid ${C.border}` }}
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="w-12 text-center text-sm font-medium tabular-nums" style={{ color: C.dark }}>
                            {quantity.toLocaleString('fa-IR')}
                          </span>
                          <button
                            onClick={() => adjustQty(1)}
                            disabled={quantity >= product.stockQuantity}
                            className="w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-30"
                            style={{ color: C.dark, borderRight: `1px solid ${C.border}` }}
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                        <span className="text-xs" style={{ color: C.muted }}>
                          {product.stockQuantity.toLocaleString('fa-IR')} عدد موجود
                        </span>
                      </div>

                      {/* Add to cart */}
                      <button
                        onClick={handleAdd}
                        disabled={added}
                        className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium text-white transition-colors"
                        style={{
                          backgroundColor: added ? C.green : C.cta,
                          borderRadius: '3px',
                        }}
                        onMouseEnter={e => { if (!added) (e.currentTarget as HTMLElement).style.backgroundColor = C.ctaHov }}
                        onMouseLeave={e => { if (!added) (e.currentTarget as HTMLElement).style.backgroundColor = C.cta }}
                      >
                        {added ? (
                          <>
                            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                            به سبد افزوده شد
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                            افزودن به سبد
                          </>
                        )}
                      </button>

                      {added && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <Link
                            href="/cart"
                            className="block w-full text-center py-3 text-sm border transition-colors"
                            style={{ borderColor: C.border, color: C.dark, borderRadius: '3px' }}
                          >
                            مشاهده سبد خرید
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="w-full py-4 text-center text-sm"
                      style={{ border: `1px solid ${C.border}`, borderRadius: '3px', color: C.muted }}
                    >
                      این محصول موجود نیست
                    </div>
                  )}
                </motion.div>
              </div>
            </section>

            {/* Related products */}
            {related.length > 0 && (
              <section
                className="py-14 md:py-20"
                style={{ backgroundColor: C.bg2, borderTop: `1px solid ${C.border}` }}
              >
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                  <div className="mb-10">
                    <p className="text-xs tracking-editorial mb-2" style={{ color: C.muted }}>پیشنهاد</p>
                    <h2 className="text-xl font-bold" style={{ color: C.dark, letterSpacing: '-0.02em' }}>محصولات مرتبط</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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

      {/* Sticky mobile add-to-cart bar */}
      {product && !isOutOfStock && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}
        >
          <div className="min-w-0">
            <p className="text-xs truncate" style={{ color: C.muted }}>{product.name}</p>
            <p className="text-sm font-bold" style={{ color: C.dark }}>
              {fmtPrice(product.discountedPrice ?? product.price)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={added}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white shrink-0"
            style={{ backgroundColor: added ? C.green : C.cta, borderRadius: '3px' }}
          >
            {added ? (
              <>
                <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                افزوده شد
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                افزودن به سبد
              </>
            )}
          </button>
        </div>
      )}

      <Footer />
    </div>
  )
}
