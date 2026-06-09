'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MotionValue,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#FAFAF8',
  dark:   '#1C1A18',
  muted:  '#8A8078',
  border: '#E5DED1',
  rail:   '#C4B08A',   // warm muted gold for the editorial path
}

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Editorial path geometry ──────────────────────────────────────────────────
// viewBox="0 0 100 100" with preserveAspectRatio="none" — x/y are % of section.
//
// The path stays strictly in the outer gutters (x ≤ 5% / x ≥ 95%) while it
// runs alongside image columns, so it NEVER overlaps the photography.
// Horizontal crossings happen only during the inter-block padding zones —
// pure ivory background, no images present at those y positions.
//
//   y ≈ 0–14   : statement → sweep into left gutter
//   y ≈ 14–38  : left gutter, alongside Block 01 image (image at x 8–52%)
//   y ≈ 38–43  : inter-block padding → sweep across to right gutter (no image)
//   y ≈ 43–68  : right gutter, alongside Block 02 image (image at x 49–92%)
//   y ≈ 68–73  : inter-block padding → sweep back to left gutter (no image)
//   y ≈ 73–97  : left gutter, alongside Block 03 image
//   y ≈ 97–99  : return to centre bottom
const RAIL_PATH =
  'M 50,2 C 50,7 8,11 5,14 L 5,38 C 5,40 95,41 95,43 L 95,68 C 95,70 5,71 5,73 L 5,97 C 5,98 50,99 50,99'

// ─── Section 1: Centered editorial statement ──────────────────────────────────
function EditorialStatement() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const noAnim = useReducedMotion() ?? false

  return (
    <section
      dir="rtl"
      style={{
        backgroundColor: C.bg,
        paddingTop: '7vh',
        paddingBottom: '10vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        ref={ref}
        style={{ maxWidth: 860, margin: '0 auto', padding: '0 5vw', textAlign: 'center' }}
      >
        {/* Eyebrow */}
        <motion.p
          className="tracking-editorial"
          style={{ fontSize: 10, color: C.muted, letterSpacing: '0.16em', marginBottom: '1.75rem' }}
          initial={noAnim ? false : { opacity: 0 }}
          animate={inView || noAnim ? { opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: EASE }}
        >
          داروخانه دکتر پویا نانوازاده
        </motion.p>

        <motion.h2
          style={{
            fontSize: 'clamp(1.9rem, 3.8vw, 3.35rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            color: C.dark,
            marginBottom: '3rem',
          }}
          initial={noAnim ? false : { opacity: 0, y: 22 }}
          animate={inView || noAnim ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.1, ease: EASE }}
        >
          سلامت و زیبایی
          <br />
          از یک انتخاب آگاهانه آغاز می‌شود
        </motion.h2>

        <motion.div
          style={{ width: 36, height: 1, backgroundColor: C.border, margin: '0 auto' }}
          initial={noAnim ? false : { scaleX: 0 }}
          animate={inView || noAnim ? { scaleX: 1 } : {}}
          transition={{ duration: 0.68, delay: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </section>
  )
}

// ─── Scroll guide rail ────────────────────────────────────────────────────────
// Absolutely positioned SVG overlay that spans the entire section.
// The line is revealed with pathLength as the user scrolls.
// A small dot travels the path via getPointAtLength → CSS left/top percentages.
// pointer-events: none throughout; hidden on mobile; respects reduced-motion.
function ScrollGuideRail({ progress }: { progress: MotionValue<number> }) {
  // The reference path (background ghost): used both for visual ghost and
  // for getPointAtLength — they share the same d string so coordinates align.
  const pathRef = useRef<SVGPathElement | null>(null)

  // Map scroll progress to the dot's position along the SVG path.
  // getPointAtLength returns coordinates in viewBox space (0-100),
  // which directly map to CSS percentages when preserveAspectRatio="none".
  const dotLeft = useTransform(progress, (p) => {
    const el = pathRef.current
    if (!el) return '50%'
    const total = el.getTotalLength()
    const pt    = el.getPointAtLength(Math.max(0, Math.min(1, p)) * total)
    return `${pt.x}%`
  })

  const dotTop = useTransform(progress, (p) => {
    const el = pathRef.current
    if (!el) return `${p * 100}%`
    const total = el.getTotalLength()
    const pt    = el.getPointAtLength(Math.max(0, Math.min(1, p)) * total)
    return `${pt.y}%`
  })

  return (
    <div
      aria-hidden="true"
      // hidden on mobile; sits above blocks (z-index:2) but pointer-events:none
      className="absolute inset-0 hidden md:block overflow-hidden"
      style={{ zIndex: 2, pointerEvents: 'none' }}
    >
      {/* ── SVG path ────────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Ghost path — full route preview, faint */}
        <path
          ref={pathRef}
          d={RAIL_PATH}
          fill="none"
          stroke={C.rail}
          strokeWidth={1.5}
          strokeOpacity={0.22}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Drawn path — reveals as user scrolls */}
        <motion.path
          d={RAIL_PATH}
          fill="none"
          stroke={C.rail}
          strokeWidth={1.5}
          strokeOpacity={0.44}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: progress }}
        />
      </svg>

      {/* ── Traveling dot ───────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          left: dotLeft,
          top: dotTop,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: C.rail,
          translateX: '-50%',
          translateY: '-50%',
          boxShadow: '0 0 14px rgba(196,176,138,0.45), 0 0 5px rgba(196,176,138,0.65)',
        }}
      />
    </div>
  )
}

// ─── Single editorial block ───────────────────────────────────────────────────
interface BlockProps {
  image:        string
  imageAlt:     string
  title:        string
  description:  string
  ctaLabel:     string
  ctaHref:      string
  imageLeft?:   boolean
  imageFilter?: MotionValue<string>   // subtle brightness lift from scroll guide
}

function EditorialBlock({
  image,
  imageAlt,
  title,
  description,
  ctaLabel,
  ctaHref,
  imageLeft    = true,
  imageFilter,
}: BlockProps) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const noAnim = useReducedMotion() ?? false
  const [hov, setHov] = useState(false)

  // When !imageLeft: image is first in DOM but CSS order swaps it right on desktop.
  // Mobile: order-1 (image) stays above order-2 (text) regardless.
  const imgOrderClass  = imageLeft ? '' : 'order-1 md:order-2'
  const textOrderClass = imageLeft ? '' : 'order-2 md:order-1'
  const gridCols       = imageLeft
    ? 'md:grid-cols-[55fr_45fr]'
    : 'md:grid-cols-[45fr_55fr]'

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: C.bg,
        padding: 'clamp(4.5rem, 9vh, 8rem) clamp(1.25rem, 8vw, 6rem)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className={`grid grid-cols-1 items-center gap-10 md:gap-[clamp(2rem,5vw,5rem)] ${gridCols}`}
        style={{ direction: 'ltr' }}
      >
        {/* ── Image ──────────────────────────────────────────────────────────── */}
        <motion.div
          className={`relative overflow-hidden aspect-3/2 md:aspect-4/5 ${imgOrderClass}`}
          style={{ borderRadius: 36, filter: imageFilter }}
          initial={noAnim ? false : { opacity: 0, scale: 1.025 }}
          animate={inView || noAnim ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.15, ease: EASE }}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 92vw, 50vw"
          />
        </motion.div>

        {/* ── Text ───────────────────────────────────────────────────────────── */}
        <motion.div
          className={`flex flex-col justify-center ${textOrderClass}`}
          style={{ padding: '0 clamp(0.5rem, 2.5vw, 2.5rem)' }}
          dir="rtl"
          initial={noAnim ? false : { opacity: 0, y: 18 }}
          animate={inView || noAnim ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.88, delay: 0.14, ease: EASE }}
        >
          <div style={{ width: 24, height: 1, backgroundColor: C.border, marginBottom: '1.75rem' }} />

          <h3
            style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2.4rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: C.dark,
              marginBottom: '1rem',
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: 'clamp(0.875rem, 1.05vw, 1rem)',
              color: C.muted,
              lineHeight: 1.85,
              marginBottom: '2.25rem',
              maxWidth: '40ch',
            }}
          >
            {description}
          </p>

          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2"
            style={{
              fontSize: 12,
              letterSpacing: '0.07em',
              color: hov ? C.dark : C.muted,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
          >
            {ctaLabel}
            <motion.span
              animate={{ x: hov ? -3 : 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ display: 'flex' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.4} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Exported section ─────────────────────────────────────────────────────────
export function EditorialStorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const noAnim     = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Subtle brightness lift (4%) when the dot reaches each image.
  // Keypoints are tuned to the approximate SVG path y-coordinates
  // where the dot dwells near each image block.
  const b1 = useTransform(scrollYProgress, [0.12, 0.24, 0.35, 0.44], [1, 1.04, 1.04, 1])
  const b2 = useTransform(scrollYProgress, [0.40, 0.52, 0.64, 0.73], [1, 1.04, 1.04, 1])
  const b3 = useTransform(scrollYProgress, [0.66, 0.78, 0.92, 1.00], [1, 1.04, 1.04, 1])

  // Convert to CSS filter strings (Framer Motion interpolates the number first)
  const f1 = useTransform(b1, (v) => `brightness(${v})`)
  const f2 = useTransform(b2, (v) => `brightness(${v})`)
  const f3 = useTransform(b3, (v) => `brightness(${v})`)

  return (
    <section
      ref={sectionRef}
      aria-label="مجموعه‌های داروخانه"
      style={{ position: 'relative' }}
    >
      {/* Scroll-driven editorial path — desktop only, respects reduced-motion */}
      {!noAnim && <ScrollGuideRail progress={scrollYProgress} />}

      <EditorialStatement />

      <EditorialBlock
        image="/images/cat-skincare.jpg"
        imageAlt="محصولات مراقبت پوست"
        title="مراقبت پوست"
        description="محصولات منتخب برای روتین روزانه و مراقبت تخصصی از پوست."
        ctaLabel="مشاهده محصولات"
        ctaHref="/products?category=skincare"
        imageLeft
        imageFilter={noAnim ? undefined : f1}
      />

      <EditorialBlock
        image="/images/cat-supplements.jpg"
        imageAlt="مکمل‌های غذایی و مراقبت مو"
        title="مکمل‌ها"
        description="حمایت از سلامت روزانه با مکمل‌های منتخب و قابل اعتماد."
        ctaLabel="مشاهده محصولات"
        ctaHref="/products?category=supplements"
        imageLeft={false}
        imageFilter={noAnim ? undefined : f2}
      />

      <EditorialBlock
        image="/images/brand-story.jpg"
        imageAlt="ثبت نسخه آنلاین"
        title="ثبت نسخه آنلاین"
        description="نسخه خود را بارگذاری کنید و سفارش خود را سریع و مطمئن ثبت نمایید."
        ctaLabel="ثبت نسخه"
        ctaHref="/track-order"
        imageLeft
        imageFilter={noAnim ? undefined : f3}
      />
    </section>
  )
}
