'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion'
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

// ─── Viewport fade-in ─────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  y = 20,
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
  const inView = useInView(ref, { once: true, margin: '-48px' })
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

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs tracking-editorial mb-2.5" style={{ color: C.muted }}>
        {eyebrow}
      </p>
      <h2
        className="text-2xl md:text-3xl font-bold"
        style={{ color: C.dark, letterSpacing: '-0.025em', lineHeight: 1.15 }}
      >
        {title}
      </h2>
    </div>
  )
}

// ─── CTA button ───────────────────────────────────────────────────────────────
function CtaButton({
  href,
  children,
  variant = 'primary',
  fullWidthMobile = false,
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  fullWidthMobile?: boolean
}) {
  const [hov, setHov] = useState(false)
  const isPrimary = variant === 'primary'
  const bg  = isPrimary ? (hov ? C.ctaHov : C.cta) : hov ? C.bg2 : 'transparent'
  const clr = isPrimary ? C.white : C.dark
  const brd = isPrimary ? 'none' : `1px solid ${C.border}`

  return (
    <Link href={href} className={fullWidthMobile ? 'block sm:inline-block' : ''}>
      <motion.button
        className={`flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium ${
          fullWidthMobile ? 'w-full sm:w-auto' : ''
        }`}
        style={{
          backgroundColor: bg,
          color: clr,
          border: brd,
          borderRadius: 3,
          transition: 'background-color 0.22s ease',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {children}
        <motion.span
          animate={{ x: hov ? -3 : 0 }}
          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
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

  function handleSearch(e: React.FormEvent) {
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

// ─── Category cards ───────────────────────────────────────────────────────────
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

  return (
    <FadeIn delay={index * 0.08}>
      <Link
        href={`/products?category=${slug}`}
        className="block relative overflow-hidden"
        style={{ borderRadius: 6, aspectRatio: '3/4' }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Background SVG with scale on hover */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hov ? 1.04 : 1 }}
          transition={{ duration: 0.7, ease: EASE_SMOOTH }}
        >
          <SVG />
        </motion.div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hov ? 0.2 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ backgroundColor: C.dark }}
        />

        {/* Text */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
          <motion.div
            className="h-px mb-3"
            animate={{ width: hov ? '100%' : '0%' }}
            transition={{ duration: 0.5, ease: EASE_ENTER }}
            style={{ backgroundColor: C.white }}
          />
          <p
            className="text-[10px] tracking-editorial mb-1"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            مجموعه
          </p>
          <h3
            className="text-sm md:text-base font-bold leading-tight"
            style={{ color: '#F0EBE2', textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}
          >
            {label}
          </h3>
          <motion.div
            animate={{ height: hov ? 28 : 0, opacity: hov ? 1 : 0 }}
            transition={{ duration: 0.35, ease: EASE_SMOOTH }}
            style={{ overflow: 'hidden' }}
          >
            <p
              className="text-xs mt-1 leading-snug"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {sub}
            </p>
          </motion.div>
        </div>
      </Link>
    </FadeIn>
  )
}

// ─── Why choose us ────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: BadgeCheck,  title: 'ضمانت اصالت کالا', desc: 'تمامی محصولات دارای گواهی اصالت از تامین‌کننده رسمی هستند.' },
  { icon: Truck,       title: 'ارسال سریع',        desc: 'ارسال به سراسر ایران در کمترین زمان ممکن با پیک معتبر.' },
  { icon: ShieldCheck, title: 'خرید امن',          desc: 'پرداخت از طریق درگاه‌های معتبر بانکی با رمز یکبار مصرف.' },
  { icon: Leaf,        title: 'محصولات معتبر',     desc: 'منتخبی از بهترین برندهای داخلی و خارجی در حوزه سلامت.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [cms, setCms]         = useState<HomepageSettings | null>(null)
  const [featCats, setFeatCats] = useState<Category[]>([])
  const [promos, setPromos]   = useState<PublicPromotion[]>([])

  // Parallax for hero image
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])

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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }} dir="rtl">
      <Header />

      <main className="flex-1">

        {/* ══ GLOBAL SEARCH ══════════════════════════════════════════════════
            Central entry point — immediately below nav, always visible on load.
        */}
        <section className="py-4 md:py-5" style={{ backgroundColor: C.bg }}>
          <div className="max-w-2xl mx-auto px-5 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASE_ENTER }}
            >
              <PremiumSearchBar />
            </motion.div>
          </div>
        </section>

        {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
        {heroEnabled && (
          <section
            style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}
          >
            <div ref={heroRef} className="max-w-7xl mx-auto">
              <div className="flex flex-col md:grid md:grid-cols-2 md:min-h-[82vh]">

                {/* Visual — parallax on scroll */}
                <motion.div
                  className="order-2 md:order-2 relative overflow-hidden min-h-55 md:min-h-0"
                  style={{ maxHeight: '85vh' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.1, ease: EASE_ENTER }}
                >
                  <motion.div className="absolute inset-0" style={{ y: heroImgY }}>
                    <HeroEditorialSVG />
                  </motion.div>
                </motion.div>

                {/* Text column */}
                <div
                  className="order-1 md:order-1 flex flex-col justify-center px-6 md:px-16 lg:px-20 py-10 md:py-24"
                  style={{ backgroundColor: C.bg }}
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
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ CATEGORIES ═════════════════════════════════════════════════════ */}
        <section
          className="py-14 md:py-28"
          style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <FadeIn className="flex items-end justify-between mb-8 md:mb-14">
              <SectionHeading eyebrow="دسته‌بندی‌ها" title="مجموعه محصولات" />
              <Link
                href="/products"
                className="flex items-center gap-1.5 text-sm"
                style={{ color: C.muted }}
              >
                مشاهده همه
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {(featCatOk
                ? featCats.slice(0, 5).map((cat, i) => {
                    const data =
                      CATEGORY_CARDS.find(c => c.slug === cat.slug) ??
                      CATEGORY_CARDS[i % CATEGORY_CARDS.length]
                    return <CategoryCard key={cat.id} {...data} label={cat.name} index={i} />
                  })
                : CATEGORY_CARDS.map((cat, i) => (
                    <CategoryCard key={cat.slug} {...cat} index={i} />
                  ))
              )}
            </div>
          </div>
        </section>

        {/* ══ ALL PRODUCTS CTA ═══════════════════════════════════════════════
            Replaces the product grid — clean, editorial, conversion-focused.
        */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}
        >
          <FadeIn className="max-w-xl mx-auto px-6 md:px-10 text-center">
            <p className="text-xs tracking-editorial mb-4" style={{ color: C.green }}>
              کشف کنید
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ color: C.dark, letterSpacing: '-0.025em', lineHeight: 1.2 }}
            >
              بیش از هزار محصول<br className="hidden sm:block" /> در انتظار شماست
            </h2>
            <p
              className="text-sm md:text-base leading-relaxed mb-8"
              style={{ color: C.muted }}
            >
              از مراقبت پوست تا مکمل‌های تخصصی — همه با تضمین اصالت و ارسال سریع
            </p>
            <CtaButton href="/products" variant="primary" fullWidthMobile>
              مشاهده همه محصولات
            </CtaButton>
          </FadeIn>
        </section>

        {/* ══ BRAND STORY ════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2">

              {/* Text column */}
              <FadeIn className="flex flex-col justify-center order-2 md:order-1 px-6 md:px-16 lg:px-20 py-10 md:py-28">
                <div className="max-w-md space-y-7">
                  <p className="text-xs tracking-editorial" style={{ color: C.green }}>
                    داستان ما
                  </p>
                  <h2
                    className="font-bold"
                    style={{
                      fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
                      color: C.dark,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.12,
                    }}
                  >
                    کیفیت را از منبع<br />تضمین می‌کنیم
                  </h2>
                  <div style={{ height: 1, width: 40, backgroundColor: C.border }} />
                  <p className="leading-relaxed" style={{ color: C.muted }}>
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

              {/* Image column */}
              <FadeIn
                delay={0.15}
                className="relative overflow-hidden order-1 md:order-2 min-h-65 md:min-h-120"
              >
                <PharmacyStorySVG />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ══ PROMOTIONAL BANNER ═════════════════════════════════════════════ */}
        {promoEnabled && (
          <section
            className="py-12 md:py-20"
            style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}
          >
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <FadeIn y={16}>
                <div
                  className="grid md:grid-cols-2 overflow-hidden"
                  style={{ backgroundColor: '#2A2320', borderRadius: 8 }}
                >
                  {/* Text */}
                  <div
                    className="flex flex-col justify-center order-2 md:order-1
                               p-7 md:p-14 lg:p-16 space-y-5 md:space-y-7"
                  >
                    <p className="text-xs tracking-editorial" style={{ color: C.cta }}>
                      {promos[0]?.bannerText ?? 'پیشنهاد ویژه'}
                    </p>
                    <h2
                      className="font-bold text-white"
                      style={{
                        fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.08,
                      }}
                    >
                      {promos[0]?.title ?? cms?.promoBannerTitle ?? 'پیشنهاد ویژه این هفته'}
                    </h2>
                    <div
                      style={{ height: 1, width: 40, backgroundColor: 'rgba(201,130,103,0.35)' }}
                    />
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#9A9088', maxWidth: '36ch' }}
                    >
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
                  <div
                    className="relative overflow-hidden order-1 md:order-2 min-h-55 md:min-h-120"
                  >
                    <PromoBannerSVG />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to right, transparent 45%, #2A2320 100%)',
                      }}
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* ══ WHY CHOOSE US ══════════════════════════════════════════════════ */}
        <section
          className="py-14 md:py-28"
          style={{ backgroundColor: C.bg2, borderTop: `1px solid ${C.border}` }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <FadeIn className="mb-10 md:mb-16">
              <SectionHeading eyebrow="چرا داروخانه سبز" title="تجربه‌ای متفاوت در هر خرید" />
            </FadeIn>

            {/* Hairline-grid layout — editorial technique */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4"
              style={{ gap: '1px', backgroundColor: C.border }}
            >
              {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                <FadeIn key={title} delay={i * 0.08} y={14}>
                  <div
                    className="flex flex-col gap-5 p-5 md:p-10"
                    style={{ backgroundColor: C.bg2 }}
                  >
                    <span
                      className="text-[11px] tracking-editorial"
                      style={{ color: C.muted }}
                    >
                      ۰{i + 1}
                    </span>
                    <Icon className="w-5 h-5" strokeWidth={1.4} style={{ color: C.green }} />
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm leading-snug" style={{ color: C.dark }}>
                        {title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ABOUT (CMS-driven) ═════════════════════════════════════════════ */}
        {aboutOk && (
          <section
            className="py-12 md:py-20"
            style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}
          >
            <FadeIn className="max-w-2xl mx-auto px-6 md:px-10 text-center">
              <p className="text-xs tracking-editorial mb-4" style={{ color: C.green }}>
                درباره ما
              </p>
              <h2
                className="text-xl md:text-2xl font-bold mb-5"
                style={{ color: C.dark, letterSpacing: '-0.02em' }}
              >
                {cms?.aboutTitle}
              </h2>
              <p className="leading-relaxed text-sm" style={{ color: C.muted }}>
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
