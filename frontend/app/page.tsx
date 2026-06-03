'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Leaf, ShieldCheck, Truck } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard } from '@/components/public-product-card'
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
  getFeaturedProducts,
  getHomepageSettings,
  getPublicProducts,
  getPublicPromotions,
} from '@/lib/api'
import type { HomepageSettings } from '@/types/cms'
import type { Category } from '@/types/category'
import type { PublicProduct } from '@/types/public-product'
import type { PublicPromotion } from '@/types/promotion'

// ─── Animation constants ──────────────────────────────────────────────────────
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const
const EASE_ENTER  = [0.16, 1,   0.3,  1] as const

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     '#FAFAF8',
  bg2:    '#EFE7DA',
  bg3:    '#E8E2D5',
  dark:   '#232323',
  muted:  '#6F6A61',
  border: '#E5DED1',
  green:  '#2F7A4D',
  cta:    '#C98267',
  ctaHov: '#B5704F',
  white:  '#FFFFFF',
}

// ─── Scroll-triggered fade-in ─────────────────────────────────────────────────
function FadeIn({
  children, delay = 0, duration = 0.65, y = 24, className, style,
}: {
  children: React.ReactNode
  delay?: number; duration?: number; y?: number
  className?: string; style?: React.CSSProperties
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: EASE_ENTER }}
      className={className} style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs tracking-editorial mb-3" style={{ color: C.muted }}>{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-bold"
        style={{ color: C.dark, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
        {title}
      </h2>
    </div>
  )
}

// ─── CTA button with arrow motion ────────────────────────────────────────────
function CtaButton({
  href, children, variant = 'primary',
}: {
  href: string; children: React.ReactNode; variant?: 'primary' | 'outline'
}) {
  const [hov, setHov] = useState(false)
  const isPrimary     = variant === 'primary'
  const bg  = isPrimary ? (hov ? C.ctaHov : C.cta) : hov ? C.bg2 : 'transparent'
  const clr = isPrimary ? C.white : C.dark
  const brd = isPrimary ? 'none' : `1px solid ${C.border}`

  return (
    <Link href={href}>
      <motion.button
        className="flex items-center gap-2 px-8 py-3.5 text-sm font-medium"
        style={{ backgroundColor: bg, color: clr, border: brd, borderRadius: 3, transition: 'background-color 0.22s ease' }}
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

// ─── Category cards with editorial SVG backgrounds ────────────────────────────
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
    <FadeIn delay={index * 0.09}>
      <Link
        href={`/products?category=${slug}`}
        className="block relative overflow-hidden"
        style={{ borderRadius: 4, aspectRatio: '3/4' }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* ── SVG editorial background ─────────────────────────────── */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hov ? 1.04 : 1 }}
          transition={{ duration: 0.75, ease: EASE_SMOOTH }}
        >
          <SVG />
        </motion.div>

        {/* ── Hover dark overlay ───────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hov ? 0.22 : 0 }}
          transition={{ duration: 0.45 }}
          style={{ backgroundColor: C.dark }}
        />

        {/* ── Text block at bottom ─────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          {/* Animated underline */}
          <motion.div
            className="h-px mb-4"
            animate={{ width: hov ? '100%' : 0 }}
            transition={{ duration: 0.55, ease: EASE_ENTER }}
            style={{ backgroundColor: C.white }}
          />
          <p className="text-[11px] tracking-editorial mb-1.5"
            style={{ color: hov ? 'rgba(255,255,255,0.7)' : 'rgba(247,242,232,0.7)' }}>
            مجموعه
          </p>
          <h3 className="text-base md:text-lg font-bold"
            style={{ color: hov ? C.white : '#F0EBE2', textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>
            {label}
          </h3>
          {/* Sub text reveal */}
          <motion.div
            animate={{ height: hov ? 36 : 0, opacity: hov ? 1 : 0 }}
            transition={{ duration: 0.4, ease: EASE_SMOOTH }}
            style={{ overflow: 'hidden' }}
          >
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {sub}
            </p>
          </motion.div>
          <motion.div
            animate={{ opacity: hov ? 1 : 0, x: hov ? 0 : 6 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
            className="flex items-center gap-1 mt-2.5 text-xs"
            style={{ color: C.white }}
          >
            مشاهده
            <ArrowLeft className="w-3 h-3" strokeWidth={2} />
          </motion.div>
        </div>
      </Link>
    </FadeIn>
  )
}

// ─── Why Choose Us data ───────────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: BadgeCheck, title: 'ضمانت اصالت کالا',   desc: 'تمامی محصولات دارای گواهی اصالت از تامین‌کننده رسمی هستند.' },
  { icon: Truck,      title: 'ارسال سریع',          desc: 'ارسال به سراسر ایران در کمترین زمان ممکن با پیک معتبر.' },
  { icon: ShieldCheck,title: 'خرید امن',            desc: 'پرداخت از طریق درگاه‌های معتبر بانکی با رمز یکبار مصرف.' },
  { icon: Leaf,       title: 'محصولات معتبر',       desc: 'منتخبی از بهترین برندهای داخلی و خارجی در حوزه سلامت.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [cms, setCms]           = useState<HomepageSettings | null>(null)
  const [latest, setLatest]     = useState<PublicProduct[]>([])
  const [featured, setFeatured] = useState<PublicProduct[]>([])
  const [featCats, setFeatCats] = useState<Category[]>([])
  const [promos, setPromos]     = useState<PublicPromotion[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getHomepageSettings(),
      getPublicProducts({ sort: 'newest' }),
      getFeaturedProducts(),
      getFeaturedCategories(),
      getPublicPromotions(),
    ]).then(([cmsR, latR, featR, catR, promoR]) => {
      if (cmsR.status === 'fulfilled')   setCms(cmsR.value)
      if (latR.status === 'fulfilled')   setLatest(latR.value.slice(0, 8))
      if (featR.status === 'fulfilled')  setFeatured(featR.value.slice(0, 4))
      if (catR.status === 'fulfilled')   setFeatCats(catR.value)
      if (promoR.status === 'fulfilled') setPromos(promoR.value)
      setLoading(false)
    })
  }, [])

  const heroEnabled  = !cms || cms.isHeroEnabled
  const featProdOk   = (!cms || cms.isFeaturedProductsEnabled) && featured.length > 0
  const featCatOk    = (!cms || cms.isFeaturedCategoriesEnabled) && featCats.length > 0
  const promoEnabled = !cms || cms.isPromoEnabled
  const aboutOk      = (!cms || cms.isAboutEnabled) && cms?.aboutTitle

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }} dir="rtl">
      <Header />

      <main className="flex-1">

        {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
        {heroEnabled && (
          <section style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:grid md:grid-cols-2 md:min-h-[88vh]">

                {/* Visual — editorial SVG + optional real product overlay */}
                <motion.div
                  className="order-2 md:order-2 relative overflow-hidden min-h-[55vw] md:min-h-0"
                  style={{ maxHeight: '90vh' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, ease: EASE_ENTER }}
                >
                  {/* Editorial brand visual — always present */}
                  <HeroEditorialSVG />

                  {/* Real product images overlay (when available) */}
                  {featured.length > 0 && featured[0].images?.length > 0 && (() => {
                    const img = featured[0].images.find(i => i.isPrimary) ?? featured[0].images[0]
                    return (
                      <motion.div
                        className="absolute overflow-hidden"
                        style={{
                          width: 180, height: 280, borderRadius: 5,
                          right: '12%', top: '50%', transform: 'translateY(-50%)',
                          boxShadow: '28px 36px 80px rgba(50,42,36,0.25)',
                          zIndex: 20,
                        }}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.6, ease: EASE_ENTER }}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}${img.imageUrl}`}
                          alt={featured[0].name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )
                  })()}
                </motion.div>

                {/* Text column */}
                <div
                  className="order-1 md:order-1 flex flex-col justify-center px-6 md:px-16 lg:px-20 py-10 md:py-24"
                  style={{ backgroundColor: C.bg }}
                >
                  <motion.p className="text-xs tracking-editorial mb-7" style={{ color: C.green }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: EASE_ENTER }}
                  >
                    داروخانه سبز — مراقبت و زیبایی
                  </motion.p>

                  {/* Staggered headline */}
                  <div className="space-y-1 mb-8" style={{ overflow: 'hidden' }}>
                    {(cms?.heroTitle
                      ? [cms.heroTitle]
                      : ['زیبایی، سلامت', 'و مراقبت', 'برای زندگی بهتر']
                    ).map((line, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.2 + i * 0.12, ease: EASE_ENTER }}
                      >
                        <span className="block font-bold leading-none" style={{
                          fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                          color: i === 2 ? C.muted : C.dark,
                          fontWeight: i === 2 ? 400 : 700,
                          letterSpacing: '-0.03em',
                        }}>
                          {line}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div className="mb-7"
                    initial={{ width: 0 }} animate={{ width: 44 }}
                    transition={{ duration: 0.8, delay: 0.55, ease: EASE_ENTER }}
                    style={{ height: 1, backgroundColor: C.border }}
                  />

                  <motion.p className="text-base leading-relaxed mb-10"
                    style={{ color: C.muted, maxWidth: '38ch' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.75, delay: 0.5, ease: EASE_ENTER }}
                  >
                    {cms?.heroSubtitle ?? 'منتخبی از محصولات آرایشی، بهداشتی و مراقبتی با تضمین اصالت کالا و ارسال سریع.'}
                  </motion.p>

                  <motion.div className="flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.65, ease: EASE_ENTER }}
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

        {/* ══ CATEGORIES — full editorial SVG cards ══════════════════════════ */}
        <section className="py-10 md:py-28"
          style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <FadeIn className="flex items-end justify-between mb-6 md:mb-16">
              <SectionHeading eyebrow="دسته‌بندی‌ها" title="مجموعه محصولات" />
              <Link href="/products"
                className="flex items-center gap-1.5 text-sm" style={{ color: C.muted }}>
                مشاهده همه
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {(featCatOk
                ? featCats.slice(0, 5).map((cat, i) => {
                    const data = CATEGORY_CARDS.find(c => c.slug === cat.slug) ?? CATEGORY_CARDS[i % CATEGORY_CARDS.length]
                    return <CategoryCard key={cat.id} {...data} label={cat.name} index={i} />
                  })
                : CATEGORY_CARDS.map((cat, i) => <CategoryCard key={cat.slug} {...cat} index={i} />)
              )}
            </div>
          </div>
        </section>

        {/* ══ FEATURED PRODUCTS ══════════════════════════════════════════════ */}
        {(featProdOk || (!loading && latest.length > 0)) && (
          <section className="py-10 md:py-28"
            style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <FadeIn className="flex items-end justify-between mb-6 md:mb-16">
                <SectionHeading
                  eyebrow={featProdOk ? 'انتخاب سردبیر' : 'تازه‌ترین اضافه‌ها'}
                  title={featProdOk ? 'محصولات منتخب' : 'جدیدترین محصولات'}
                />
                <Link href="/products"
                  className="flex items-center gap-1.5 text-sm" style={{ color: C.muted }}>
                  مشاهده همه
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </FadeIn>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="mb-5" style={{ aspectRatio: '3/4', backgroundColor: C.bg2, borderRadius: 3 }} />
                      <div className="space-y-2.5">
                        <div className="h-2 rounded" style={{ backgroundColor: C.border, width: '45%' }} />
                        <div className="h-3 rounded" style={{ backgroundColor: C.border, width: '80%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                  {(featProdOk ? featured : latest.slice(0, 4)).map((p, i) => (
                    <PublicProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ WHY CHOOSE US — editorial feature grid ═════════════════════════ */}
        <section className="py-10 md:py-32"
          style={{ backgroundColor: C.bg2, borderTop: `1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6 md:px-10">

            {/* Header — RTL-native right-aligned, NOT centred */}
            <FadeIn className="mb-8 md:mb-20">
              <SectionHeading eyebrow="چرا داروخانه سبز" title="تجربه‌ای متفاوت در هر خرید" />
            </FadeIn>

            {/*
              gap-px + background on the wrapper creates a 1-px hairline grid
              between cells — a premium editorial technique (FT, Monocle, etc.)
            */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4"
              style={{ gap: '1px', backgroundColor: C.border }}
            >
              {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                <FadeIn key={title} delay={i * 0.09} y={14}>
                  <div
                    className="flex flex-col gap-5 p-5 md:p-10"
                    style={{ backgroundColor: C.bg2 }}
                  >
                    {/* Ordinal number — Persian digits */}
                    <span
                      className="text-[11px] tracking-editorial"
                      style={{ color: C.muted }}
                    >
                      ۰{i + 1}
                    </span>

                    {/* Icon — raw, no circle, keeps it lean */}
                    <Icon
                      className="w-5 h-5"
                      strokeWidth={1.4}
                      style={{ color: C.green }}
                    />

                    {/* Copy */}
                    <div className="space-y-3">
                      <h3
                        className="font-bold text-base leading-snug"
                        style={{ color: C.dark }}
                      >
                        {title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
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

        {/* ══ BRAND STORY — full-height image & text split ═══════════════════ */}
        <section style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}>
          {/*
            No horizontal padding on the outer container — the image bleeds
            to the max-w-7xl edge on both sides for a more editorial feel.
            Each column adds its own internal spacing.
          */}
          <div className="max-w-7xl mx-auto">
            <div
              className="grid md:grid-cols-2"
              style={{ minHeight: 600 }}
            >
              {/*
                RTL grid: col-1 = RIGHT, col-2 = LEFT.
                TEXT in col-1 → RIGHT. IMAGE in col-2 → LEFT.
                On mobile (single-col): order-1 = image first (visual hook),
                order-2 = text below it.
              */}

              {/* TEXT column */}
              <FadeIn className="flex flex-col justify-center order-2 md:order-1
                                 px-6 md:px-16 lg:px-20 py-8 md:py-24">
                <div className="max-w-md space-y-8">
                  <p
                    className="text-xs tracking-editorial"
                    style={{ color: C.green }}
                  >
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
                    داروخانه سبز با همکاری مستقیم با برندهای معتبر ایرانی و
                    خارجی، محصولاتی را عرضه می‌کند که کیفیت آنها از مبدا
                    تضمین شده است.
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                    هر محصول قبل از عرضه، تاییدیه اصالت دریافت می‌کند. ما
                    به پیشنهاد متخصصین داروخانه اعتقاد داریم — نه فقط فروش.
                  </p>
                  <CtaButton href="/products" variant="outline">
                    مشاهده محصولات
                  </CtaButton>
                </div>
              </FadeIn>

              {/*
                IMAGE column — fills its grid track fully (no aspect-ratio
                constraint). `relative overflow-hidden` is required so
                BrandStoryPhoto's `absolute inset-0` child is correctly
                clipped and positioned.
              */}
              <FadeIn
                delay={0.15}
                className="relative overflow-hidden order-1 md:order-2 min-h-65 md:min-h-120"
              >
                <PharmacyStorySVG />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ══ PROMOTIONAL BANNER — dark editorial ════════════════════════════ */}
        {promoEnabled && (
          <section className="py-10 md:py-28"
            style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <FadeIn y={16}>
                {/*
                  RTL grid: col-1 = RIGHT (text), col-2 = LEFT (image).
                  Mobile: image order-1 (visual hook first), text order-2.
                  Desktop: text order-1 → RIGHT, image order-2 → LEFT.
                */}
                <div
                  className="grid md:grid-cols-2 overflow-hidden"
                  style={{ backgroundColor: '#2A2320', borderRadius: 6 }}
                >
                  {/* TEXT column — RIGHT on desktop, BELOW image on mobile */}
                  <div
                    className="flex flex-col justify-center order-2 md:order-1
                               p-6 md:p-14 lg:p-16 space-y-5 md:space-y-7"
                  >
                    <p
                      className="text-xs tracking-editorial"
                      style={{ color: C.cta }}
                    >
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
                    <div
                      style={{
                        height: 1, width: 40,
                        backgroundColor: 'rgba(201,130,103,0.35)',
                      }}
                    />
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#9A9088', maxWidth: '36ch' }}
                    >
                      {promos[0]?.description ?? cms?.promoBannerSubtitle
                        ?? 'محصولات منتخب مراقبتی با قیمت ویژه برای مدت محدود.'}
                    </p>
                    {/* CtaButton already contains its own Link — no extra wrapping */}
                    <div>
                      <CtaButton
                        href={promos[0] ? `/promotions/${promos[0].slug}` : '/products'}
                        variant="primary"
                      >
                        مشاهده پیشنهادها
                      </CtaButton>
                    </div>
                  </div>

                  {/*
                    IMAGE column — LEFT on desktop, TOP on mobile.
                    Gradient overlay: transparent on the LEFT edge → dark (#2A2320)
                    on the RIGHT edge, so the photo dissolves into the text column.
                    Physical direction is correct regardless of dir="rtl" because
                    CSS gradient directions use physical axes.
                  */}
                  <div
                    className="relative overflow-hidden order-1 md:order-2 min-h-55 md:min-h-120"
                  >
                    <PromoBannerSVG />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to right, transparent 45%, #2A2320 100%)',
                      }}
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* ══ LATEST PRODUCTS ════════════════════════════════════════════════ */}
        {latest.length > 0 && (
          <section className="py-10 md:py-28"
            style={{ backgroundColor: C.bg2, borderTop: `1px solid ${C.border}` }}>
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <FadeIn className="flex items-end justify-between mb-6 md:mb-16">
                <SectionHeading eyebrow="تازه‌ترین اضافه‌ها" title="جدیدترین محصولات" />
                <Link href="/products?sort=newest"
                  className="flex items-center gap-1.5 text-sm" style={{ color: C.muted }}>
                  مشاهده همه
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </FadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                {latest.map((p, i) => (
                  <PublicProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
              <div className="mt-10 text-center sm:hidden">
                <Link href="/products">
                  <motion.button className="px-8 py-3.5 text-sm border"
                    style={{ borderColor: C.border, color: C.dark, borderRadius: 3 }}
                    whileTap={{ scale: 0.97 }}>
                    مشاهده همه محصولات
                  </motion.button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══ BRAND PHILOSOPHY ═══════════════════════════════════════════════ */}
        <section className="py-10 md:py-32"
          style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}>
          <FadeIn y={12} className="max-w-3xl mx-auto px-6 md:px-10 text-center">
            <motion.div className="mx-auto mb-12"
              initial={{ width: 0 }} whileInView={{ width: 36 }} viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE_ENTER }}
              style={{ height: 1, backgroundColor: C.border }}
            />
            <blockquote className="text-2xl md:text-3xl font-bold"
              style={{ color: C.dark, letterSpacing: '-0.02em', lineHeight: 1.5 }}>
              مراقبت از خود، سرمایه‌گذاری در زندگی‌ست.
            </blockquote>
            <p className="text-sm mt-6" style={{ color: C.muted }}>— داروخانه سبز</p>
            <motion.div className="mx-auto mt-12"
              initial={{ width: 0 }} whileInView={{ width: 36 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE_ENTER }}
              style={{ height: 1, backgroundColor: C.border }}
            />
          </FadeIn>
        </section>

        {/* ══ ABOUT (CMS-driven) ═════════════════════════════════════════════ */}
        {aboutOk && (
          <section className="py-10"
            style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
            <FadeIn className="max-w-2xl mx-auto px-6 md:px-10 text-center">
              <p className="text-xs tracking-editorial mb-4" style={{ color: C.green }}>درباره ما</p>
              <h2 className="text-xl md:text-2xl font-bold mb-5"
                style={{ color: C.dark, letterSpacing: '-0.02em' }}>
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
