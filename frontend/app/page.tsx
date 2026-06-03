'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Leaf, Search, ShieldCheck, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import {
  HeroEditorialSVG,
  PharmacyStorySVG,
  PromoBannerSVG,
  SkincareSVG,
  HairCareSVG,
  SupplementsSVG,
  HygieneSVG,
  FragranceSVG,
} from '@/components/public/brand-visuals'
import { BotanicalPhilosophyLayer } from '@/components/public/botanical-philosophy'
import {
  getFeaturedCategories,
  getHomepageSettings,
  getPublicPromotions,
} from '@/lib/api'
import type { HomepageSettings } from '@/types/cms'
import type { Category } from '@/types/category'
import type { PublicPromotion } from '@/types/promotion'

// ─── Animation constants ──────────────────────────────────────────────────────
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const
const EASE_ENTER  = [0.16, 1,   0.3,  1] as const

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#FAFAF8',
  bg2:     '#EFE7DA',
  dark:    '#232323',
  ink:     '#1C1A18',   // near-black for dark sections
  muted:   '#6F6A61',
  border:  '#E5DED1',
  green:   '#2F7A4D',
  cta:     '#C98267',
  ctaHov:  '#B5704F',
  white:   '#FFFFFF',
}

// ─── Viewport fade-in ─────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  duration = 0.65,
  y = 22,
  className,
  style,
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
  style?: React.CSSProperties
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-56px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: EASE_ENTER }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── CTA button — three variants ──────────────────────────────────────────────
function CtaButton({
  href,
  children,
  variant = 'primary',
  fullWidthMobile = false,
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  fullWidthMobile?: boolean
}) {
  const [hov, setHov] = useState(false)

  const styles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: hov ? C.ctaHov : C.cta,
      color: C.white,
      border: 'none',
    },
    outline: {
      backgroundColor: hov ? C.bg2 : 'transparent',
      color: C.dark,
      border: `1px solid ${C.border}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: hov ? 'rgba(255,255,255,0.7)' : C.white,
      border: `1px solid rgba(255,255,255,0.25)`,
    },
  }

  return (
    <Link href={href} className={fullWidthMobile ? 'block sm:inline-block' : ''}>
      <motion.button
        className={`flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium ${
          fullWidthMobile ? 'w-full sm:w-auto' : ''
        }`}
        style={{ ...styles[variant], borderRadius: 3, transition: 'background-color 0.2s ease, color 0.2s ease' }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {children}
        <motion.span
          animate={{ x: hov ? -4 : 0 }}
          transition={{ duration: 0.22, ease: EASE_SMOOTH }}
          style={{ display: 'flex' }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </motion.span>
      </motion.button>
    </Link>
  )
}

// ─── Premium Search Bar ───────────────────────────────────────────────────────
function PremiumSearchBar() {
  const [focused, setFocused] = useState(false)
  const [query, setQuery]     = useState('')
  const router = useRouter()

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    router.push(
      query.trim()
        ? `/products?search=${encodeURIComponent(query.trim())}`
        : '/products',
    )
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div
        className="flex items-center gap-3 px-5 transition-all duration-300"
        style={{
          height: 60,
          borderRadius: 20,
          backgroundColor: C.white,
          border: `1.5px solid ${focused ? C.green : C.border}`,
          boxShadow: focused
            ? '0 0 0 4px rgba(47,122,77,0.09), 0 4px 20px rgba(35,35,35,0.09)'
            : '0 2px 14px rgba(35,35,35,0.06)',
          cursor: 'text',
        }}
        onClick={() => document.getElementById('hp-search')?.focus()}
      >
        <motion.div
          animate={{ color: focused ? C.green : C.muted }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </motion.div>

        <input
          id="hp-search"
          type="search"
          placeholder="جستجوی محصولات، برندها و دسته‌بندی‌ها"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm md:text-[15px]"
          style={{ color: C.dark, caretColor: C.green }}
          dir="rtl"
          autoComplete="off"
          autoCorrect="off"
        />

        <AnimatePresence>
          {query.trim() && (
            <motion.button
              key="go"
              type="submit"
              initial={{ opacity: 0, scale: 0.82, x: 6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.82, x: 6 }}
              transition={{ duration: 0.18, ease: EASE_ENTER }}
              className="shrink-0 px-4 py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: C.green, borderRadius: 12 }}
              whileTap={{ scale: 0.93 }}
            >
              جستجو
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

// ─── Category card ────────────────────────────────────────────────────────────
const CATEGORY_CARDS = [
  { slug: 'skincare',    label: 'مراقبت پوست', sub: 'کرم، سرم، مرطوب‌کننده',    SVG: SkincareSVG    },
  { slug: 'hair-care',   label: 'مراقبت مو',   sub: 'شامپو، ماسک، سرم مو',       SVG: HairCareSVG    },
  { slug: 'cosmetics',   label: 'آرایشی',      sub: 'لیپ‌گلاس، ریمل، فونداسیون', SVG: FragranceSVG   },
  { slug: 'supplements', label: 'مکمل‌ها',     sub: 'ویتامین، مینرال، پروتئین',  SVG: SupplementsSVG },
  { slug: 'hygiene',     label: 'بهداشت فردی', sub: 'اسپری، دئودورانت، صابون',  SVG: HygieneSVG     },
]

function CategoryCard({
  slug, label, sub, SVG, index,
}: (typeof CATEGORY_CARDS)[0] & { index: number }) {
  const [hov, setHov] = useState(false)
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-32px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: EASE_ENTER }}
    >
      <Link
        href={`/products?category=${slug}`}
        className="block relative overflow-hidden"
        style={{ borderRadius: 8, aspectRatio: '3/4' }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hov ? 1.05 : 1 }}
          transition={{ duration: 0.8, ease: EASE_SMOOTH }}
        >
          <SVG />
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hov ? 0.25 : 0.06 }}
          transition={{ duration: 0.4 }}
          style={{ backgroundColor: C.dark }}
        />

        {/* Bottom gradient for text legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(30,25,20,0.65) 0%, transparent 100%)' }}
        />

        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
          <p className="text-[10px] tracking-editorial mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            مجموعه
          </p>
          <h3 className="text-sm md:text-base font-semibold leading-tight" style={{ color: '#F5F0EC' }}>
            {label}
          </h3>
          <motion.p
            animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 6 }}
            transition={{ duration: 0.28, ease: EASE_SMOOTH }}
            className="text-xs mt-1 leading-snug"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {sub}
          </motion.p>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Trust items ──────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: BadgeCheck,  title: 'ضمانت اصالت کالا', desc: 'تمامی محصولات دارای گواهی اصالت از تامین‌کننده رسمی هستند.' },
  { icon: Truck,       title: 'ارسال سریع',        desc: 'ارسال به سراسر ایران در کمترین زمان ممکن با پیک معتبر.' },
  { icon: ShieldCheck, title: 'خرید امن',          desc: 'پرداخت از طریق درگاه‌های معتبر بانکی با رمز یکبار مصرف.' },
  { icon: Leaf,        title: 'محصولات معتبر',     desc: 'منتخبی از بهترین برندهای داخلی و خارجی در حوزه سلامت.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [cms, setCms]           = useState<HomepageSettings | null>(null)
  const [featCats, setFeatCats] = useState<Category[]>([])
  const [promos, setPromos]     = useState<PublicPromotion[]>([])

  // Hero scroll-linked transforms
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const prefersReducedMotion = useReducedMotion() ?? false
  const imgScale    = useTransform(scrollYProgress, [0, 1], [1,    1.08])
  const imgY        = useTransform(scrollYProgress, [0, 1], [0,   -40])
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1,  0.72])
  const textY       = useTransform(scrollYProgress, [0, 1],    [0, -20])

  useEffect(() => {
    Promise.allSettled([
      getHomepageSettings(),
      getFeaturedCategories(),
      getPublicPromotions(),
    ]).then(([cmsR, catR, promoR]) => {
      if (cmsR.status === 'fulfilled')   setCms(cmsR.value)
      if (catR.status === 'fulfilled')   setFeatCats(catR.value)
      if (promoR.status === 'fulfilled') setPromos(promoR.value)
    })
  }, [])

  const heroEnabled  = !cms || cms.isHeroEnabled
  const featCatOk    = (!cms || cms.isFeaturedCategoriesEnabled) && featCats.length > 0
  const promoEnabled = !cms || cms.isPromoEnabled
  const aboutOk      = (!cms || cms.isAboutEnabled) && cms?.aboutTitle

  const categoryList = featCatOk
    ? featCats.slice(0, 5).map((cat, i) => {
        const data = CATEGORY_CARDS.find(c => c.slug === cat.slug) ?? CATEGORY_CARDS[i % CATEGORY_CARDS.length]
        return { ...data, id: cat.id, label: cat.name }
      })
    : CATEGORY_CARDS.map(c => ({ ...c, id: c.slug }))

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }} dir="rtl">
      <Header />

      <main className="flex-1 overflow-x-hidden">

        {/* ══ SEARCH ════════════════════════════════════════════════════════════ */}
        <section className="pt-4 pb-5 md:pt-5 md:pb-6" style={{ backgroundColor: C.bg }}>
          <div className="max-w-2xl mx-auto px-5 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE_ENTER }}
            >
              <PremiumSearchBar />
            </motion.div>
          </div>
        </section>

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        {heroEnabled && (
          <section style={{ backgroundColor: C.bg }}>
            <div ref={heroRef} className="max-w-7xl mx-auto">
              <div className="flex flex-col md:grid md:grid-cols-2 md:min-h-[82vh]">

                {/* Image — scroll parallax */}
                <motion.div
                  className="order-2 md:order-2 relative overflow-hidden min-h-55 md:min-h-0"
                  style={{ maxHeight: '85vh' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.1, ease: EASE_ENTER }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={prefersReducedMotion ? {} : { scale: imgScale, y: imgY }}
                  >
                    <HeroEditorialSVG />
                  </motion.div>
                </motion.div>

                {/* Text */}
                <motion.div
                  className="order-1 md:order-1 flex flex-col justify-center px-6 md:px-16 lg:px-20 py-10 md:py-24"
                  style={{
                    backgroundColor: C.bg,
                    ...(prefersReducedMotion ? {} : { opacity: textOpacity, y: textY }),
                  }}
                >
                  <motion.p
                    className="text-xs tracking-editorial mb-6"
                    style={{ color: C.green }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.25, ease: EASE_ENTER }}
                  >
                    داروخانه سبز — مراقبت و زیبایی
                  </motion.p>

                  <div className="space-y-1 mb-7" style={{ overflow: 'hidden' }}>
                    {(cms?.heroTitle
                      ? [cms.heroTitle]
                      : ['زیبایی، سلامت', 'و مراقبت', 'برای زندگی بهتر']
                    ).map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.11, ease: EASE_ENTER }}
                      >
                        <span
                          className="block font-bold leading-none"
                          style={{
                            fontSize: 'clamp(1.9rem, 4.5vw, 3.5rem)',
                            color: i === 2 ? C.muted : C.dark,
                            fontWeight: i === 2 ? 400 : 700,
                            letterSpacing: '-0.03em',
                          }}
                        >
                          {line}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    className="mb-6"
                    initial={{ width: 0 }}
                    animate={{ width: 44 }}
                    transition={{ duration: 0.75, delay: 0.62, ease: EASE_ENTER }}
                    style={{ height: 1, backgroundColor: C.border }}
                  />

                  <motion.p
                    className="text-base leading-relaxed mb-9"
                    style={{ color: C.muted, maxWidth: '38ch' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.65, delay: 0.58, ease: EASE_ENTER }}
                  >
                    {cms?.heroSubtitle ??
                      'منتخبی از محصولات آرایشی، بهداشتی و مراقبتی با تضمین اصالت کالا و ارسال سریع.'}
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.72, ease: EASE_ENTER }}
                  >
                    <CtaButton href={cms?.heroButtonLink ?? '/products'} variant="primary">
                      {cms?.heroButtonText ?? 'مشاهده محصولات'}
                    </CtaButton>
                    <CtaButton href="/products" variant="outline">
                      دسته‌بندی‌ها
                    </CtaButton>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ══ BRAND PHILOSOPHY ══════════════════════════════════════════════════
            Signature quote — very large type, maximal whitespace.
            Botanical layer lives in the surrounding negative space at low opacity
            so it supports the typography without competing with it.
        */}
        <section
          className="relative py-28 md:py-48 overflow-hidden"
          style={{ backgroundColor: C.bg }}
        >
          {/* Animated botanical environment — absolute, aria-hidden, z-0 */}
          <BotanicalPhilosophyLayer />

          {/* Quote — above botanical layer */}
          <FadeIn y={16} className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 text-center">
            {/* Top rule */}
            <motion.div
              className="mx-auto mb-14 md:mb-20"
              initial={{ width: 0 }}
              whileInView={{ width: 44 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE_ENTER }}
              style={{ height: 1, backgroundColor: C.border }}
            />

            <blockquote
              className="font-light"
              style={{
                fontSize: 'clamp(2.1rem, 7vw, 5.5rem)',
                color: C.dark,
                letterSpacing: '-0.04em',
                lineHeight: 1.08,
              }}
            >
              مراقبت از خود،
              <br />
              <span style={{ color: C.muted, fontWeight: 300 }}>سرمایه‌گذاری</span>
              <br />
              در زندگی‌ست.
            </blockquote>

            <p
              className="mt-10 md:mt-14 text-xs tracking-editorial"
              style={{ color: C.muted }}
            >
              — داروخانه سبز
            </p>

            {/* Bottom rule */}
            <motion.div
              className="mx-auto mt-14 md:mt-20"
              initial={{ width: 0 }}
              whileInView={{ width: 44 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_ENTER }}
              style={{ height: 1, backgroundColor: C.border }}
            />
          </FadeIn>
        </section>

        {/* ══ CATEGORIES ════════════════════════════════════════════════════════
            Horizontal swipe on mobile — immersive, edge-to-edge.
            5-column grid on desktop.
        */}
        <section className="pt-16 pb-20 md:pt-20 md:pb-28" style={{ backgroundColor: C.white }}>

          {/* Heading — constrained */}
          <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 md:mb-14">
            <FadeIn className="flex items-end justify-between">
              <div>
                <p className="text-xs tracking-editorial mb-2.5" style={{ color: C.muted }}>دسته‌بندی‌ها</p>
                <h2
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: C.dark, letterSpacing: '-0.025em', lineHeight: 1.15 }}
                >
                  مجموعه محصولات
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-1.5 text-sm"
                style={{ color: C.muted }}
              >
                مشاهده همه
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </FadeIn>
          </div>

          {/* Mobile — horizontal swipe strip, full-bleed */}
          <div className="md:hidden scrollbar-hidden overflow-x-auto flex gap-3 px-6 pb-2">
            {categoryList.map((cat, i) => (
              <div key={cat.id} className="shrink-0 w-[44vw]">
                <CategoryCard {...cat} index={i} />
              </div>
            ))}
            {/* Trailing spacer so last card doesn't sit flush at edge */}
            <div className="shrink-0 w-2" aria-hidden />
          </div>

          {/* Mobile — "see all" link below strip */}
          <div className="md:hidden mt-6 px-6">
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-sm"
              style={{ color: C.muted }}
            >
              مشاهده همه دسته‌بندی‌ها
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          {/* Desktop — 5-column grid, constrained */}
          <div className="hidden md:block max-w-7xl mx-auto px-10">
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoryList.map((cat, i) => (
                <CategoryCard key={cat.id} {...cat} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ ALL PRODUCTS CTA ══════════════════════════════════════════════════
            Full-bleed dark strip — editorial, impactful.
            Background creates a strong visual beat in the page rhythm.
        */}
        <section className="py-24 md:py-40" style={{ backgroundColor: C.ink }}>
          <FadeIn y={14} className="max-w-2xl mx-auto px-6 md:px-10 text-center">
            <p
              className="text-xs tracking-editorial mb-8"
              style={{ color: 'rgba(201,130,103,0.65)' }}
            >
              کشف کنید
            </p>
            <h2
              className="font-light mb-6"
              style={{
                fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                color: '#F0EBE2',
                letterSpacing: '-0.04em',
                lineHeight: 1.08,
              }}
            >
              بیش از هزار محصول<br />
              <span style={{ fontWeight: 600 }}>در انتظار شماست</span>
            </h2>
            <p
              className="text-sm md:text-base leading-relaxed mb-12"
              style={{ color: 'rgba(240,235,226,0.45)', maxWidth: '36ch', margin: '0 auto 3rem' }}
            >
              از مراقبت پوست تا مکمل‌های تخصصی — همه با تضمین اصالت
            </p>
            <CtaButton href="/products" variant="ghost" fullWidthMobile>
              مشاهده همه محصولات
            </CtaButton>
          </FadeIn>
        </section>

        {/* ══ BRAND STORY ═══════════════════════════════════════════════════════
            Full-width layout — image fills its column edge-to-edge vertically.
            Text column has generous internal padding; no outer max-width cap.
        */}
        <section className="overflow-hidden" style={{ backgroundColor: C.bg }}>
          <div className="grid md:grid-cols-2">

            {/* Text column */}
            <FadeIn className="order-2 md:order-1 flex flex-col justify-center
                               px-6 md:px-14 lg:px-20 py-16 md:py-36">
              <div className="max-w-md mx-auto md:mx-0 space-y-8">
                <p className="text-xs tracking-editorial" style={{ color: C.green }}>
                  داستان ما
                </p>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: 'clamp(1.8rem, 3vw, 2.75rem)',
                    color: C.dark,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  کیفیت را از منبع<br />تضمین می‌کنیم
                </h2>
                <div style={{ height: 1, width: 36, backgroundColor: C.border }} />
                <p className="leading-relaxed text-sm md:text-base" style={{ color: C.muted }}>
                  داروخانه سبز با همکاری مستقیم با برندهای معتبر ایرانی و خارجی،
                  محصولاتی را عرضه می‌کند که کیفیت آنها از مبدا تضمین شده است.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                  هر محصول قبل از عرضه، تاییدیه اصالت دریافت می‌کند. ما به پیشنهاد
                  متخصصین داروخانه اعتقاد داریم — نه فقط فروش.
                </p>
                <CtaButton href="/products" variant="outline">
                  مشاهده محصولات
                </CtaButton>
              </div>
            </FadeIn>

            {/* Image column — fills full section height, no outer padding */}
            <FadeIn
              delay={0.18}
              className="order-1 md:order-2 relative overflow-hidden min-h-72 md:min-h-0 md:self-stretch"
            >
              {/* Extend image beyond grid row for visual bleed */}
              <div className="absolute inset-0 md:-inset-y-12">
                <PharmacyStorySVG />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ══ PROMO BANNER ══════════════════════════════════════════════════════
            Floating dark card with generous breathing room around it.
        */}
        {promoEnabled && (
          <section className="py-16 md:py-28" style={{ backgroundColor: C.bg }}>
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <FadeIn y={18}>
                <div
                  className="grid md:grid-cols-2 overflow-hidden"
                  style={{
                    backgroundColor: '#2A2320',
                    borderRadius: 12,
                    boxShadow: '0 24px 80px rgba(35,35,35,0.18)',
                  }}
                >
                  {/* Text */}
                  <div className="flex flex-col justify-center order-2 md:order-1
                                 p-8 md:p-14 lg:p-16 space-y-5 md:space-y-7">
                    <p className="text-xs tracking-editorial" style={{ color: C.cta }}>
                      {promos[0]?.bannerText ?? 'پیشنهاد ویژه'}
                    </p>
                    <h2
                      className="font-bold text-white"
                      style={{
                        fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.08,
                      }}
                    >
                      {promos[0]?.title ?? cms?.promoBannerTitle ?? 'پیشنهاد ویژه این هفته'}
                    </h2>
                    <div style={{ height: 1, width: 36, backgroundColor: 'rgba(201,130,103,0.3)' }} />
                    <p className="text-sm leading-relaxed" style={{ color: '#8A8078', maxWidth: '36ch' }}>
                      {promos[0]?.description ?? cms?.promoBannerSubtitle ??
                        'محصولات منتخب مراقبتی با قیمت ویژه برای مدت محدود.'}
                    </p>
                    <div>
                      <CtaButton
                        href={promos[0] ? `/promotions/${promos[0].slug}` : '/products'}
                        variant="primary"
                      >
                        مشاهده پیشنهادها
                      </CtaButton>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="relative overflow-hidden order-1 md:order-2 min-h-55 md:min-h-120">
                    <PromoBannerSVG />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to right, transparent 40%, #2A2320 100%)' }}
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* ══ TRUST ═════════════════════════════════════════════════════════════
            Minimal list layout — ordinal + icon + copy, lots of air.
            No hairline grid, no boxes. Pure editorial.
        */}
        <section className="py-20 md:py-36" style={{ backgroundColor: C.bg2 }}>
          <div className="max-w-3xl mx-auto px-6 md:px-10">

            <FadeIn className="mb-16 md:mb-24">
              <p className="text-xs tracking-editorial mb-3" style={{ color: C.muted }}>
                چرا داروخانه سبز
              </p>
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: C.dark, letterSpacing: '-0.025em', lineHeight: 1.15 }}
              >
                تجربه‌ای متفاوت<br />در هر خرید
              </h2>
            </FadeIn>

            <div>
              {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                <FadeIn key={title} delay={i * 0.07} y={10}>
                  <div
                    className="flex items-start gap-6 py-7 md:py-10"
                    style={{
                      borderBottom: i < WHY_ITEMS.length - 1
                        ? `1px solid ${C.border}`
                        : 'none',
                    }}
                  >
                    {/* Ordinal */}
                    <span
                      className="font-mono text-xs tracking-wider shrink-0 mt-0.5 select-none"
                      style={{ color: C.muted, opacity: 0.45 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Icon */}
                    <Icon
                      className="w-4 h-4 shrink-0 mt-0.5"
                      strokeWidth={1.3}
                      style={{ color: C.green }}
                    />

                    {/* Copy */}
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-sm md:text-base mb-1.5"
                        style={{ color: C.dark }}
                      >
                        {title}
                      </h3>
                      <p
                        className="text-xs md:text-sm leading-relaxed"
                        style={{ color: C.muted }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ABOUT (CMS-driven) ════════════════════════════════════════════════ */}
        {aboutOk && (
          <section className="py-16 md:py-28" style={{ backgroundColor: C.bg }}>
            <FadeIn className="max-w-xl mx-auto px-6 md:px-10 text-center">
              <p className="text-xs tracking-editorial mb-5" style={{ color: C.green }}>
                درباره ما
              </p>
              <h2
                className="text-xl md:text-2xl font-bold mb-6"
                style={{ color: C.dark, letterSpacing: '-0.02em', lineHeight: 1.25 }}
              >
                {cms?.aboutTitle}
              </h2>
              <p className="leading-relaxed text-sm md:text-base" style={{ color: C.muted }}>
                {cms?.aboutDescription}
              </p>
            </FadeIn>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}
