'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Truck, Shield, HeadphonesIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { categories, getBestsellers, getNewProducts } from '@/lib/products'

export default function HomePage() {
  const bestsellers = getBestsellers()
  const newProducts = getNewProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-secondary/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>محصولات اصل با ضمانت اصالت</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                  زیبایی طبیعی
                  <br />
                  <span className="text-primary">سلامت پایدار</span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  مجموعه‌ای از بهترین محصولات مراقبت از پوست، آرایشی و مکمل‌های غذایی از معتبرترین برندهای جهان را در داروخانه سبز کشف کنید.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/products">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8">
                      مشاهده محصولات
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </Link>
                  <Link href="/products?category=skincare">
                    <Button size="lg" variant="outline" className="rounded-xl px-8 border-primary/30 hover:bg-primary/5">
                      مراقبت از پوست
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
                  <Image
                    src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
                    alt="محصولات مراقبت از پوست"
                    fill
                    className="object-cover rounded-3xl shadow-2xl"
                    priority
                  />
                </div>
                
                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-4 -right-4 bg-card p-4 rounded-2xl shadow-lg hidden md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">ضمانت اصالت</p>
                      <p className="text-sm text-muted-foreground">تمامی محصولات</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -top-4 -left-4 bg-card p-4 rounded-2xl shadow-lg hidden md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">ارسال رایگان</p>
                      <p className="text-sm text-muted-foreground">سفارش بالای ۵۰۰ هزار</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'ارسال سریع', desc: 'به سراسر ایران' },
                { icon: Shield, title: 'ضمانت اصالت', desc: 'محصولات اورجینال' },
                { icon: HeadphonesIcon, title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی آنلاین' },
                { icon: Sparkles, title: 'کیفیت برتر', desc: 'برندهای معتبر' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">دسته‌بندی محصولات</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                مجموعه کاملی از محصولات مراقبتی و زیبایی برای پاسخگویی به نیازهای شما
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={`/products?category=${category.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-sm">{category.name}</h3>
                        <p className="text-white/70 text-xs">{category.productCount} محصول</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">پرفروش‌ترین‌ها</h2>
                <p className="text-muted-foreground">محصولات محبوب مشتریان ما</p>
              </div>
              <Link href="/products?sort=bestsellers">
                <Button variant="outline" className="hidden md:flex rounded-xl">
                  مشاهده همه
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestsellers.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/products?sort=bestsellers">
                <Button variant="outline" className="rounded-xl">
                  مشاهده همه محصولات
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">جدیدترین محصولات</h2>
                <p className="text-muted-foreground">تازه‌ها را از دست ندهید</p>
              </div>
              <Link href="/products?sort=newest">
                <Button variant="outline" className="hidden md:flex rounded-xl">
                  مشاهده همه
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden"
            >
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80"
                  alt="Banner"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-foreground/70" />
              </div>
              
              <div className="relative py-16 md:py-24 px-6 md:px-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  عضو خانواده سبز شوید
                </h2>
                <p className="text-white/80 max-w-xl mx-auto mb-8">
                  با ثبت شماره موبایل خود از تخفیف‌های ویژه، پیشنهادات اختصاصی و جدیدترین محصولات باخبر شوید.
                </p>
                <Link href="/products">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8">
                    خرید کنید
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
