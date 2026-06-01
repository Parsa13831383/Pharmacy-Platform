'use client'

import Link from 'next/link'
import { ShoppingBag, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import { getMediaUrl } from '@/lib/media'
import { Button } from '@/components/ui/button'
import type { PublicProduct } from '@/types/public-product'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtPrice(amount: string | number): string {
  return Number(amount).toLocaleString('fa-IR') + ' تومان'
}

function stockLabel(qty: number, threshold: number): { text: string; cls: string } {
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

function gradientFor(slug: string | null | undefined): string {
  return (slug && GRADIENT_BY_SLUG[slug]) ?? 'from-primary/5 to-primary/15'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  product: PublicProduct
  index?: number
}

export function PublicProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart()
  const stock = stockLabel(product.stockQuantity, product.lowStockThreshold)
  const isOutOfStock = product.stockQuantity === 0
  const hasDiscount = product.discountedPrice != null
  const gradient = gradientFor(product.category?.slug)
  const primaryImg = product.images?.find(img => img.isPrimary) ?? product.images?.[0]

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) addItem(product, 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.45 }}
    >
      <Link href={`/products/${product.slug}`} className="group block h-full">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 h-full flex flex-col">
          {/* Image area */}
          <div
            className={`relative aspect-4/3 ${primaryImg ? 'bg-muted/30' : `bg-linear-to-br ${gradient}`} flex items-center justify-center overflow-hidden`}
          >
            {primaryImg ? (
              <img
                src={getMediaUrl(primaryImg.imageUrl)}
                alt={primaryImg.altText ?? product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <Leaf
                className="w-12 h-12 text-primary/20 group-hover:text-primary/30 transition-colors duration-300"
                strokeWidth={1.5}
              />
            )}

            {/* Discount badge */}
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                تخفیف
              </span>
            )}
            {/* Stock badge */}
            <span
              className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${stock.cls}`}
            >
              {stock.text}
            </span>
            {/* Hover add button */}
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Button
                onClick={handleAdd}
                disabled={isOutOfStock}
                size="sm"
                className="w-full rounded-xl gap-1.5 bg-card/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground border border-border/60"
                variant="outline"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                افزودن به سبد
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1 gap-2">
            {/* Brand + Category */}
            <div className="flex items-center gap-2 min-w-0">
              {product.brand && (
                <span className="text-xs text-muted-foreground truncate">{product.brand}</span>
              )}
              {product.brand && product.category && (
                <span className="text-muted-foreground/40 text-xs">·</span>
              )}
              {product.category && (
                <span className="text-xs text-muted-foreground/70 truncate">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="font-medium text-foreground text-sm leading-relaxed line-clamp-2 flex-1">
              {product.name}
            </h3>

            {/* Price */}
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
                <span className="font-bold text-foreground text-sm">
                  {fmtPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
