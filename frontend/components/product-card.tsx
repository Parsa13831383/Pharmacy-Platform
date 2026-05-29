'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { Product, formatPrice } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      image: product.image,
      category: product.category,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            
            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  جدید
                </span>
              )}
              {product.originalPrice && (
                <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                  تخفیف
                </span>
              )}
            </div>

            {/* Quick Add Button */}
            <motion.div 
              className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ y: 10 }}
              whileHover={{ y: 0 }}
            >
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary/95 hover:bg-primary text-primary-foreground rounded-xl"
                size="sm"
              >
                <ShoppingBag className="w-4 h-4 ml-2" />
                افزودن به سبد
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Brand */}
            <span className="text-xs text-muted-foreground">{product.brand}</span>
            
            {/* Name */}
            <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-relaxed">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 pt-1">
              <span className="font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
