'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Share2, Star, Check, Truck, Shield, ArrowRight, Minus, Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { getProductById, formatPrice, products, getProductsByCategory } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { notFound } from 'next/navigation'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = getProductById(id)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  if (!product) {
    notFound()
  }

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4)

  const images = product.images || [product.image]

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        image: product.image,
        category: product.category,
      } as unknown as import('@/types/public-product').PublicProduct)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-secondary/30 py-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
              <ArrowRight className="w-3 h-3" />
              <Link href="/products" className="hover:text-primary transition-colors">محصولات</Link>
              <ArrowRight className="w-3 h-3" />
              <Link 
                href={`/products?category=${product.categorySlug}`}
                className="hover:text-primary transition-colors"
              >
                {product.category}
              </Link>
              <ArrowRight className="w-3 h-3" />
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Details */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Main Image */}
                <div className="relative aspect-square bg-muted rounded-3xl overflow-hidden">
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% تخفیف
                    </div>
                  )}
                  {product.isNew && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                      جدید
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                          selectedImage === i ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Brand & Name */}
                <div>
                  <span className="text-primary text-sm font-medium">{product.brand}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                    {product.name}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">{product.nameEn}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} از ۵ ({product.reviewCount} نظر)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                {/* Volume */}
                {product.volume && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">حجم:</span>
                    <span className="text-foreground font-medium">{product.volume}</span>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-2">
                  {product.inStock ? (
                    <>
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary">موجود در انبار</span>
                      {product.stockCount < 10 && (
                        <span className="text-sm text-destructive">
                          (تنها {product.stockCount} عدد)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-destructive">ناموجود</span>
                  )}
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingBag className="w-5 h-5 ml-2" />
                    افزودن به سبد خرید
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">افزودن به علاقه‌مندی</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">اشتراک‌گذاری</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">ارسال سریع</p>
                      <p className="text-xs text-muted-foreground">ارسال ۱ تا ۳ روز کاری</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">ضمانت اصالت</p>
                      <p className="text-xs text-muted-foreground">محصول ۱۰۰٪ اورجینال</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">مشخصات محصول</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Features */}
                {product.features && (
                  <div>
                    <h3 className="font-medium text-foreground mb-4">ویژگی‌ها</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Usage */}
                {product.usage && (
                  <div>
                    <h3 className="font-medium text-foreground mb-4">روش استفاده</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.usage}</p>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h3 className="font-medium text-foreground mb-4">برچسب‌ها</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8">محصولات مرتبط</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
