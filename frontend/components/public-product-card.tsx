'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { getMediaUrl } from '@/lib/media'
import type { PublicProduct } from '@/types/public-product'

// ─── Animation constants ───────────────────────────────────────────────────────
// Premium cubic-bezier curves — smooth, deliberate, never bouncy.
const EASE_SMOOTH  = [0.25, 0.1, 0.25, 1]   as const  // Apple easing
const EASE_ENTER   = [0.16, 1,   0.3,  1]   as const  // Gentle deceleration (items entering)

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtPrice(amount: string | number): string {
  return Number(amount).toLocaleString('fa-IR') + ' تومان'
}

function discountPercent(price: string, discounted: string): number {
  const orig = Number(price)
  const disc = Number(discounted)
  if (!orig || !disc) return 0
  return Math.round(((orig - disc) / orig) * 100)
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  skincare:    'linear-gradient(150deg, #EFE7DA 0%, #D9CFC4 100%)',
  cosmetics:   'linear-gradient(150deg, #F2E8E8 0%, #DFD0CE 100%)',
  supplements: 'linear-gradient(150deg, #EAEADA 0%, #D4D0C0 100%)',
  hygiene:     'linear-gradient(150deg, #E8EEF0 0%, #CDD6D8 100%)',
  'hair-care': 'linear-gradient(150deg, #EDE8F2 0%, #D0C8DE 100%)',
  perfumes:    'linear-gradient(150deg, #F2E8EF 0%, #DFC9D8 100%)',
}

function placeholderGradient(slug?: string | null): string {
  return (slug && CATEGORY_GRADIENTS[slug]) ?? 'linear-gradient(150deg, #EFE7DA 0%, #D9CFC4 100%)'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  product: PublicProduct
  index?: number
}

export function PublicProductCard({ product, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()

  const primaryImg   = product.images?.find(img => img.isPrimary) ?? product.images?.[0]
  const hasDiscount  = product.discountedPrice != null
  const isOutOfStock = product.stockQuantity === 0
  const pct          = hasDiscount ? discountPercent(product.price, product.discountedPrice!) : 0

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) addItem(product, 1)
  }

  return (
    // ── Scroll-reveal wrapper ──────────────────────────────────────────────
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        delay: Math.min(index * 0.08, 0.32),
        duration: 0.65,
        ease: EASE_ENTER,
      }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Card lift ─────────────────────────────────────────────────── */}
        <motion.div
          animate={{ y: hovered ? -6 : 0 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        >
          {/* ── Image container ───────────────────────────────────────── */}
          <div
            className="relative overflow-hidden mb-4"
            style={{ aspectRatio: '3/4', borderRadius: 3 }}
          >
            {/* ── Placeholder — always rendered; visible when no image or on load error ── */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: placeholderGradient(product.category?.slug) }}
            >
              <motion.div
                className="rounded-full"
                style={{ width: 48, height: 48, backgroundColor: '#6F6A61' }}
                animate={{ opacity: hovered ? 0.2 : 0.12, scale: hovered ? 1.06 : 1 }}
                transition={{ duration: 0.5, ease: EASE_SMOOTH }}
              />
            </div>

            {/* ── Product image — overlays placeholder; hides itself on error ── */}
            {primaryImg && (
              <motion.div
                className="absolute inset-0"
                animate={{ scale: hovered ? 1.06 : 1 }}
                transition={{ duration: 0.75, ease: EASE_SMOOTH }}
              >
                <img
                  src={getMediaUrl(primaryImg.imageUrl)}
                  alt={primaryImg.altText ?? product.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              </motion.div>
            )}

            {/* ── Subtle dark overlay on hover ────────────────────────── */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: hovered ? 0.12 : 0 }}
              transition={{ duration: 0.4, ease: EASE_SMOOTH }}
              style={{ backgroundColor: '#232323' }}
            />

            {/* ── Discount badge ──────────────────────────────────────── */}
            {hasDiscount && pct > 0 && (
              <motion.span
                className="absolute top-3 right-3 text-xs px-2.5 py-1 font-medium text-white z-10"
                style={{ backgroundColor: '#C98267', borderRadius: 2 }}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08 + 0.2, ease: EASE_ENTER }}
              >
                {pct}٪ تخفیف
              </motion.span>
            )}

            {/* ── Out-of-stock overlay ─────────────────────────────────── */}
            {isOutOfStock && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10"
                style={{ backgroundColor: 'rgba(247,242,232,0.78)' }}
              >
                <span className="text-xs tracking-editorial" style={{ color: '#6F6A61' }}>
                  ناموجود
                </span>
              </div>
            )}

            {/* ── Add-to-cart reveal (desktop hover) ──────────────────── */}
            {!isOutOfStock && (
              <motion.button
                className="hidden md:flex absolute inset-x-0 bottom-0 items-center justify-center gap-2 py-3.5 text-sm font-medium text-white z-10"
                style={{ backgroundColor: '#232323', pointerEvents: hovered ? 'auto' : 'none' }}
                animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                onClick={handleAdd}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C98267' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#232323' }}
              >
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                افزودن به سبد
              </motion.button>
            )}

            {/* ── Mobile always-visible add button ────────────────────── */}
            {!isOutOfStock && (
              <button
                className="md:hidden absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-white z-10"
                style={{ backgroundColor: '#232323' }}
                onClick={handleAdd}
              >
                <ShoppingBag className="w-3 h-3" strokeWidth={1.5} />
                افزودن
              </button>
            )}
          </div>

          {/* ── Product info ──────────────────────────────────────────── */}
          <div className="space-y-1.5 px-0.5">
            {product.category && (
              <p className="text-[11px] tracking-editorial" style={{ color: '#6F6A61' }}>
                {product.category.name}
              </p>
            )}
            {product.brand && (
              <p className="text-xs" style={{ color: '#6F6A61' }}>{product.brand}</p>
            )}

            {/* Name fades slightly on hover (focus shifts to image) */}
            <motion.h3
              className="text-sm font-medium leading-snug line-clamp-2"
              style={{ color: '#232323' }}
              animate={{ opacity: hovered ? 0.55 : 1 }}
              transition={{ duration: 0.35, ease: EASE_SMOOTH }}
            >
              {product.name}
            </motion.h3>

            <div className="flex items-baseline gap-2 pt-0.5">
              {hasDiscount ? (
                <>
                  <span className="text-sm font-semibold" style={{ color: '#232323' }}>
                    {fmtPrice(product.discountedPrice!)}
                  </span>
                  <span className="text-xs line-through" style={{ color: '#6F6A61' }}>
                    {fmtPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold" style={{ color: '#232323' }}>
                  {fmtPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
