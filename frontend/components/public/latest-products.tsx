'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, Eye } from 'lucide-react'
import { getMediaUrl } from '@/lib/media'
import type { PublicProduct } from '@/types/public-product'

const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const
const EASE_ENTER  = [0.16, 1,   0.3,  1] as const

const C = {
  bg:     '#FAFAF8',
  dark:   '#232323',
  muted:  '#6F6A61',
  border: '#E5DED1',
  green:  '#2F7A4D',
  cta:    '#C98267',
}

const CAT_GRADIENTS: Record<string, string> = {
  skincare:    'linear-gradient(145deg, #EFE7DA 0%, #D9CFC4 100%)',
  cosmetics:   'linear-gradient(145deg, #F2E8E8 0%, #DFD0CE 100%)',
  supplements: 'linear-gradient(145deg, #EAEADA 0%, #D4D0C0 100%)',
  hygiene:     'linear-gradient(145deg, #E8EEF0 0%, #CDD6D8 100%)',
  'hair-care': 'linear-gradient(145deg, #EDE8F2 0%, #D0C8DE 100%)',
  perfumes:    'linear-gradient(145deg, #F2E8EF 0%, #DFC9D8 100%)',
}

function cardBg(slug?: string | null): string {
  return (slug && CAT_GRADIENTS[slug]) ?? 'linear-gradient(145deg, #EFE7DA 0%, #D9CFC4 100%)'
}

function fmtPrice(amount: string | number): string {
  return Number(amount).toLocaleString('fa-IR') + ' تومان'
}

// ─── Featured (newest) card ───────────────────────────────────────────────────
function FeaturedCard({ product }: { product: PublicProduct }) {
  const img   = product.images?.find(i => i.isPrimary) ?? product.images?.[0]
  const price = product.discountedPrice ?? product.price

  return (
    <motion.div
      className="shrink-0 relative overflow-hidden"
      style={{
        width:           'clamp(240px, 34vw, 380px)',
        height:          'clamp(340px, 50vw, 520px)',
        borderRadius:    12,
        scrollSnapAlign: 'start',
        background:      cardBg(product.category?.slug),
        boxShadow:       '0 8px 40px rgba(35,35,35,0.10)',
      } as React.CSSProperties}
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: EASE_ENTER }}
      whileHover="hov"
    >
      {/* Image */}
      {img && (
        <motion.div
          className="absolute inset-0"
          variants={{ hov: { scale: 1.04 } }}
          transition={{ duration: 0.9, ease: EASE_SMOOTH }}
        >
          <img
            src={getMediaUrl(img.imageUrl)}
            alt={img.altText ?? product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </motion.div>
      )}

      {/* Cinematic gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(22,18,14,0.84) 0%, rgba(22,18,14,0.14) 52%, transparent 100%)' }}
      />

      {/* "Newest arrival" pill */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5"
        style={{
          backgroundColor:      'rgba(255,255,255,0.92)',
          borderRadius:         100,
          backdropFilter:       'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        } as React.CSSProperties}
        initial={{ opacity: 0, y: -6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: EASE_ENTER }}
      >
        <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.green }} />
        <span className="text-[10px] font-medium tracking-wide" style={{ color: C.dark }}>
          تازه وارد
        </span>
      </motion.div>

      {/* Product info overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        {product.category && (
          <p
            className="text-[10px] tracking-widest mb-2"
            style={{ color: 'rgba(255,255,255,0.50)', letterSpacing: '0.12em' }}
          >
            {product.category.name}
          </p>
        )}
        <h3
          className="font-semibold line-clamp-2 mb-3 leading-snug"
          style={{ fontSize: 'clamp(0.875rem, 1.8vw, 1.05rem)', color: '#F5F0EC' }}
        >
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold tabular-nums" style={{ color: '#F5F0EC' }}>
            {fmtPrice(price)}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2"
            style={{
              backgroundColor:      'rgba(255,255,255,0.12)',
              color:                '#F0EBE4',
              borderRadius:         6,
              border:               '1px solid rgba(255,255,255,0.18)',
              backdropFilter:       'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            } as React.CSSProperties}
          >
            مشاهده
            <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Regular product card ─────────────────────────────────────────────────────
function RegularCard({ product, index }: { product: PublicProduct; index: number }) {
  const img        = product.images?.find(i => i.isPrimary) ?? product.images?.[0]
  const hasDiscount = product.discountedPrice != null
  const price      = hasDiscount ? product.discountedPrice! : product.price
  const pct        = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.discountedPrice!)) / Number(product.price)) * 100)
    : 0

  return (
    <motion.div
      className="shrink-0"
      style={{
        width:           'clamp(140px, 18vw, 196px)',
        scrollSnapAlign: 'start',
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.055, 0.33), ease: EASE_ENTER }}
      whileHover="hov"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div
          className="relative overflow-hidden mb-3"
          style={{ aspectRatio: '3/4', borderRadius: 8, background: cardBg(product.category?.slug) }}
        >
          {img && (
            <motion.div
              className="absolute inset-0"
              variants={{ hov: { scale: 1.06 } }}
              transition={{ duration: 0.75, ease: EASE_SMOOTH }}
            >
              <img
                src={getMediaUrl(img.imageUrl)}
                alt={img.altText ?? product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            </motion.div>
          )}

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            variants={{ hov: { opacity: 0.10 } }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ backgroundColor: C.dark }}
          />

          {/* Quick view — slides up on hover */}
          <motion.div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2.5"
            style={{ backgroundColor: C.dark, color: '#F5F0EC' }}
            variants={{ hov: { y: 0, opacity: 1 } }}
            initial={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_SMOOTH }}
          >
            <Eye className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">مشاهده سریع</span>
          </motion.div>

          {/* Discount badge */}
          {hasDiscount && pct > 0 && (
            <span
              className="absolute top-2 right-2 text-[10px] font-medium text-white px-2 py-0.5 z-10"
              style={{ backgroundColor: C.cta, borderRadius: 2 }}
            >
              {pct}٪
            </span>
          )}

          {/* Out of stock */}
          {product.stockQuantity === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ backgroundColor: 'rgba(247,242,232,0.78)' }}
            >
              <span className="text-[10px] tracking-editorial" style={{ color: C.muted }}>
                ناموجود
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1 px-0.5">
          {product.brand && (
            <p className="text-[10px] truncate" style={{ color: C.muted }}>
              {product.brand}
            </p>
          )}
          <motion.h3
            className="text-xs font-medium leading-snug line-clamp-2"
            style={{ color: C.dark }}
            variants={{ hov: { opacity: 0.55 } }}
            transition={{ duration: 0.3 }}
          >
            {product.name}
          </motion.h3>
          <p className="text-xs font-semibold tabular-nums pt-0.5" style={{ color: C.dark }}>
            {fmtPrice(price)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Loading skeletons ────────────────────────────────────────────────────────
function SkeletonFeatured() {
  return (
    <div
      className="shrink-0 animate-pulse rounded-xl"
      style={{ width: 'clamp(240px, 34vw, 380px)', height: 'clamp(340px, 50vw, 520px)', backgroundColor: '#EFE7DA' }}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="shrink-0 animate-pulse" style={{ width: 'clamp(140px, 18vw, 196px)' }}>
      <div className="rounded-lg mb-3" style={{ aspectRatio: '3/4', backgroundColor: '#EFE7DA' }} />
      <div className="rounded mb-1.5" style={{ height: 8, width: '55%', backgroundColor: '#EFE7DA' }} />
      <div className="rounded mb-1" style={{ height: 10, width: '88%', backgroundColor: '#EFE7DA' }} />
      <div className="rounded" style={{ height: 10, width: '44%', backgroundColor: '#EFE7DA' }} />
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function LatestProductsSection({
  products,
  loading = false,
}: {
  products: PublicProduct[]
  loading?: boolean
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  if (!loading && products.length === 0) return null

  const [featured, ...rest] = products

  return (
    <section
      dir="rtl"
      style={{ backgroundColor: C.bg, paddingTop: 'clamp(3.5rem, 6vw, 5rem)', paddingBottom: 'clamp(3.5rem, 6vw, 5rem)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE_ENTER }}
        >
          <p className="text-xs tracking-editorial mb-2" style={{ color: C.muted }}>
            تازه‌ترین
          </p>
          <div className="flex items-end justify-between">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: C.dark, letterSpacing: '-0.025em', lineHeight: 1.15 }}
            >
              جدیدترین محصولات
            </h2>
            <Link
              href="/products?sort=newest"
              className="hidden md:flex items-center gap-1.5 text-sm"
              style={{ color: C.muted }}
            >
              مشاهده همه
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>
            تازه‌ترین محصولات اضافه شده به داروخانه
          </p>
        </motion.div>
      </div>

      {/* ── Carousel ───────────────────────────────────────────────────── */}
      <div
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hidden pb-4 md:pb-8 px-6 md:px-10"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {loading ? (
          <>
            <SkeletonFeatured />
            {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}
          </>
        ) : (
          <>
            {featured && <FeaturedCard product={featured} />}
            {rest.slice(0, 9).map((product, i) => (
              <RegularCard key={product.id} product={product} index={i} />
            ))}
          </>
        )}
        {/* Trailing padding spacer */}
        <div className="shrink-0 w-4" aria-hidden />
      </div>

      {/* ── Mobile: "see all" link ──────────────────────────────────────── */}
      <div className="md:hidden mt-5 px-6">
        <Link
          href="/products?sort=newest"
          className="flex items-center gap-1.5 text-sm"
          style={{ color: C.muted }}
        >
          مشاهده همه محصولات جدید
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  )
}
