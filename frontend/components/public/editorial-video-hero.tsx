'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
  type MotionValue,
} from 'framer-motion'
import { Pause, Play } from 'lucide-react'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:    '#FAFAF8',
  dark:  '#1A1A18',
  muted: '#8A8078',
  cta:   '#C98267',
  white: '#FFFFFF',
}

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Minimal play/pause — icon-only, no label ─────────────────────────────────
function PlayToggle({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={playing ? 'مکث ویدیو' : 'پخش ویدیو'}
      className="absolute flex items-center justify-center"
      style={{
        bottom: '0.85rem',
        left:   '0.85rem',
        zIndex: 20,
        width:  26,
        height: 26,
        border: '1px solid rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.28)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.6 }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.42)' }}
      whileTap={{ scale: 0.92 }}
    >
      {playing
        ? <Pause className="w-2.5 h-2.5 text-white" strokeWidth={1.5} />
        : <Play  className="w-2.5 h-2.5 text-white" strokeWidth={1.5} />
      }
    </motion.button>
  )
}

// ─── Centered overlay text on the video ──────────────────────────────────────
function HeroOverlayText({
  opacity,
  y,
}: {
  opacity: MotionValue<number> | number
  y: MotionValue<string> | string
}) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
      style={{ opacity, y, zIndex: 10, padding: '0 10%' }}
      dir="rtl"
    >
      {/* Eyebrow */}
      <p
        className="tracking-editorial font-light"
        style={{ fontSize: 10, color: 'rgba(255,255,255,0.48)', letterSpacing: '0.22em', marginBottom: '1.1rem' }}
      >
        داروخانه دکتر پویا نانوازاده
      </p>

      {/* Main headline */}
      <h1
        className="font-bold text-white"
        style={{
          fontSize: 'clamp(1.75rem, 3.6vw, 3.2rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '0.28em',
        }}
      >
        مراقبت روزانه پوست
      </h1>

      {/* Sub-headline */}
      <p
        className="font-light"
        style={{
          fontSize: 'clamp(0.9rem, 1.7vw, 1.45rem)',
          lineHeight: 1.32,
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '-0.01em',
          marginBottom: '2rem',
        }}
      >
        با انتخاب تخصصی داروخانه
      </p>

      {/* Accent line */}
      <div style={{ width: 22, height: 1, backgroundColor: 'rgba(201,130,103,0.5)', marginBottom: '1.8rem' }} />

      {/* CTA */}
      <Link href="/products?category=skincare">
        <motion.button
          style={{
            padding: '0.6rem 1.75rem',
            border: '1px solid rgba(255,255,255,0.36)',
            color: 'rgba(255,255,255,0.82)',
            fontSize: 11,
            letterSpacing: '0.08em',
            backgroundColor: 'transparent',
          }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.58)', color: '#fff' }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18 }}
        >
          مشاهده محصولات مراقبت پوست
        </motion.button>
      </Link>
    </motion.div>
  )
}

// ─── Dark overlay gradient ────────────────────────────────────────────────────
// Heavier at bottom (for story text readability), center scrim for headline
function VideoOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 5,
        background: [
          'linear-gradient(to top, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0.10) 28%, transparent 45%)',
          'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 18%)',
          'linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.28))',
        ].join(', '),
      }}
    />
  )
}

// ─── Image card — editorial, with title + CTA ─────────────────────────────────
function ImageCard({ src, title, href }: { src: string; title: string; href: string }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      className="relative overflow-hidden h-full"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hov ? 1.04 : 1 }}
        transition={{ duration: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 30vw, 90vw"
        />
      </motion.div>

      {/* Gradient for bottom text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 48%, transparent 100%)' }}
      />

      {/* Bottom copy */}
      <div
        className="absolute"
        style={{ bottom: '1.6rem', right: '1.6rem', left: '1.6rem' }}
        dir="rtl"
      >
        <p
          className="tracking-editorial"
          style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.18em', marginBottom: '0.35rem' }}
        >
          مجموعه
        </p>
        <p
          className="font-semibold"
          style={{ fontSize: 15, color: C.white, letterSpacing: '-0.015em', marginBottom: '0.8rem', lineHeight: 1.2 }}
        >
          {title}
        </p>
        <Link href={href}>
          <motion.button
            style={{
              padding: '0.45rem 1.1rem',
              border: `1px solid rgba(255,255,255,${hov ? '0.42' : '0.24'})`,
              color: hov ? C.white : 'rgba(255,255,255,0.65)',
              fontSize: 10,
              letterSpacing: '0.07em',
              backgroundColor: 'transparent',
              transition: 'border-color 0.22s ease, color 0.22s ease',
            }}
            whileTap={{ scale: 0.97 }}
          >
            مشاهده محصولات
          </motion.button>
        </Link>
      </div>
    </div>
  )
}

// ─── Black editorial center card ─────────────────────────────────────────────
function CenterCard() {
  const [hov, setHov] = useState(false)

  return (
    <div
      className="relative flex flex-col items-center justify-center h-full text-center px-7 md:px-9"
      style={{ backgroundColor: C.dark }}
      dir="rtl"
    >
      <p
        className="tracking-editorial"
        style={{ fontSize: 9, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.22em', marginBottom: '1.1rem' }}
      >
        انتخاب تخصصی
      </p>
      <h2
        className="font-bold text-white"
        style={{
          fontSize: 'clamp(0.95rem, 1.4vw, 1.4rem)',
          lineHeight: 1.35,
          letterSpacing: '-0.02em',
          marginBottom: '1.75rem',
          maxWidth: '22ch',
        }}
      >
        محصولاتی منتخب برای سلامت و زیبایی روزانه
      </h2>
      <div style={{ width: 18, height: 1, backgroundColor: 'rgba(201,130,103,0.32)', margin: '0 auto 1.6rem' }} />
      <Link href="/products">
        <motion.button
          style={{
            padding: '0.55rem 1.4rem',
            border: `1px solid rgba(255,255,255,${hov ? '0.3' : '0.13'})`,
            color: hov ? C.white : 'rgba(255,255,255,0.48)',
            fontSize: 10,
            letterSpacing: '0.1em',
            backgroundColor: 'transparent',
            transition: 'border-color 0.22s ease, color 0.22s ease',
          }}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          whileTap={{ scale: 0.97 }}
        >
          کشف محصولات
        </motion.button>
      </Link>
    </div>
  )
}

// ─── Desktop — reduced motion path (static, no sticky scroll) ─────────────────
function DesktopStatic({
  videoRef,
  videoError,
  onVideoError,
  playing,
  onToggle,
  cardsRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  videoError: boolean
  onVideoError: () => void
  playing: boolean
  onToggle: () => void
  cardsRef: React.RefObject<HTMLDivElement | null>
}) {
  const inView = useInView(cardsRef, { once: true, margin: '-40px' })

  return (
    <div className="hidden md:block" style={{ backgroundColor: C.bg }}>
      {/* Static video hero */}
      <div style={{ position: 'relative', margin: '0 8vw', height: '76vh', borderRadius: 36, overflow: 'hidden' }}>
        <Image src="/images/hero.jpg" alt="داروخانه دکتر پویا نانوازاده" fill className="object-cover" priority />
        {!videoError && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
            autoPlay muted loop playsInline preload="auto"
            onError={onVideoError}
          >
            <source src="/videos/hero.mp4"  type="video/mp4" />
            <source src="/videos/hero.webm" type="video/webm" />
          </video>
        )}
        <VideoOverlay />
        <HeroOverlayText opacity={1} y="0px" />
        <PlayToggle playing={playing} onClick={onToggle} />
      </div>

      {/* Static 3-card grid */}
      <div
        ref={cardsRef}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          margin: '10px 8vw 0',
          height: '56vh',
        }}
      >
        {[
          { type: 'image' as const, src: '/images/cat-skincare.jpg',    title: 'مراقبت پوست',          href: '/products?category=skincare',     delay: 0 },
          { type: 'center' as const, delay: 0.08 },
          { type: 'image' as const, src: '/images/cat-supplements.jpg', title: 'مکمل‌ها و مراقبت مو',   href: '/products?category=supplements',  delay: 0.16 },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="h-full"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: card.delay, ease: EASE }}
          >
            {card.type === 'image'
              ? <ImageCard src={card.src!} title={card.title!} href={card.href!} />
              : <CenterCard />
            }
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop — animated sticky scroll path ───────────────────────────────────
function DesktopHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)  // used in reduced-motion path
  const [playing, setPlaying]       = useState(true)
  const [videoError, setVideoError] = useState(false)
  const noAnim = useReducedMotion() ?? false

  // All transforms called unconditionally (Rules of Hooks)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // ── Hero ──────────────────────────────────────────────────────────────────
  // Video fades out and gently scales back
  const heroOpacity = useTransform(scrollYProgress, [0.26, 0.54], [1, 0])
  const heroScale   = useTransform(scrollYProgress, [0,    0.54], [1, 0.93])

  // Overlay text: fades in immediately, exits before hero container fades
  const textOpacity = useTransform(scrollYProgress, [0, 0.06, 0.20, 0.38], [0, 1, 1, 0])
  const textY       = useTransform(scrollYProgress, [0, 0.08], ['18px', '0px'])

  // ── Transition story text ─────────────────────────────────────────────────
  const storyOpacity = useTransform(scrollYProgress, [0.28, 0.40, 0.60, 0.72], [0, 1, 1, 0])
  const storyY       = useTransform(scrollYProgress, [0.28, 0.42], ['10px', '0px'])

  // ── Grid cards ────────────────────────────────────────────────────────────
  const gridOpacity = useTransform(scrollYProgress, [0.44, 0.70], [0, 1])
  const cardOpacity = useTransform(scrollYProgress, [0.44, 0.70], [0, 1])
  const leftX       = useTransform(scrollYProgress, [0.44, 0.70], ['-26px', '0px'])
  const rightX      = useTransform(scrollYProgress, [0.44, 0.70], ['26px',  '0px'])
  const midY        = useTransform(scrollYProgress, [0.44, 0.70], ['16px',  '0px'])

  // ── Scroll hint ───────────────────────────────────────────────────────────
  const hintOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0])

  function toggle() {
    if (!videoRef.current) return
    playing ? videoRef.current.pause() : videoRef.current.play()
    setPlaying(p => !p)
  }

  // Reduced motion: render a simple static layout instead
  if (noAnim) {
    return (
      <DesktopStatic
        videoRef={videoRef}
        videoError={videoError}
        onVideoError={() => setVideoError(true)}
        playing={playing}
        onToggle={toggle}
        cardsRef={cardsRef}
      />
    )
  }

  // ─── Animated version ─────────────────────────────────────────────────────
  //
  // Section height: 200vh — user scrolls ~100vh for full animation.
  // Video box: top:88px (below header), bottom:12vh, left:8vw, right:8vw
  //   → at 900px viewport this is ~78vh tall — within the 70-78vh target
  // Story text: bottom:4vh, in the ivory strip below the video
  // Grid: same absolute bounds as the video, fades in during scroll phase 2

  return (
    <section
      ref={sectionRef}
      className="hidden md:block relative"
      style={{ height: '200vh' }}
      aria-label="بخش اصلی — داروخانه دکتر پویا نانوازاده"
    >
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: '100vh', backgroundColor: C.bg }}
      >

        {/* ──── Phase 1: Cinematic video ──────────────────────────────── */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: heroOpacity }}
        >
          {/*
            Video frame: occupies the viewport below the header with
            generous horizontal margins. No aspect-ratio — height is
            driven by the viewport, removing the "player" look entirely.
          */}
          <motion.div
            style={{
              position: 'absolute',
              top:    '88px',   // just below the 72px header + 16px breathing room
              bottom: '12vh',   // ivory strip at bottom for story text
              left:   '8vw',
              right:  '8vw',
              overflow: 'hidden',
              borderRadius: 36,
              scale: heroScale,
            }}
          >
            {/* Fallback image — always present under the video */}
            <Image
              src="/images/hero.jpg"
              alt="داروخانه دکتر پویا نانوازاده"
              fill
              className="object-cover"
              priority
            />

            {/* Video layer — silently ignored if asset not found */}
            {!videoError && (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
                autoPlay muted loop playsInline preload="auto"
                onError={() => setVideoError(true)}
              >
                <source src="/videos/hero.mp4"  type="video/mp4" />
                <source src="/videos/hero.webm" type="video/webm" />
              </video>
            )}

            <VideoOverlay />

            <HeroOverlayText opacity={textOpacity} y={textY} />

            <PlayToggle playing={playing} onClick={toggle} />
          </motion.div>
        </motion.div>

        {/* ──── Transition story text — appears in ivory strip below video ── */}
        <motion.div
          className="absolute text-center"
          style={{
            bottom:    '4.5vh',
            left:      '50%',
            translateX:'-50%',
            opacity:   storyOpacity,
            y:         storyY,
            zIndex:    15,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
          dir="rtl"
        >
          <p style={{ fontSize: 12, color: C.muted, letterSpacing: '0.01em', lineHeight: 1.7 }}>
            برای پوست، مو و سلامت روزانه
          </p>
          <p style={{ fontSize: 10, color: 'rgba(138,128,120,0.5)', letterSpacing: '0.01em', marginTop: 3 }}>
            سه مسیر ساده برای انتخاب بهتر
          </p>
        </motion.div>

        {/* ──── Phase 2: 3-column editorial grid ─────────────────────── */}
        {/*
          Grid occupies the identical footprint as the video frame so the
          visual swap looks seamless — same top/bottom/left/right bounds.
        */}
        <motion.div
          className="absolute"
          style={{
            top:    '88px',
            bottom: '12vh',
            left:   '8vw',
            right:  '8vw',
            opacity: gridOpacity,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            borderRadius: 36,
            overflow: 'hidden',
          }}
          aria-hidden
        >
          <motion.div className="h-full" style={{ opacity: cardOpacity, x: leftX }}>
            <ImageCard src="/images/cat-skincare.jpg" title="مراقبت پوست" href="/products?category=skincare" />
          </motion.div>

          <motion.div className="h-full" style={{ opacity: cardOpacity, y: midY }}>
            <CenterCard />
          </motion.div>

          <motion.div className="h-full" style={{ opacity: cardOpacity, x: rightX }}>
            <ImageCard src="/images/cat-supplements.jpg" title="مکمل‌ها و مراقبت مو" href="/products?category=supplements" />
          </motion.div>
        </motion.div>

        {/* ──── Scroll hint — ivory strip, fades immediately on scroll ── */}
        <motion.div
          className="absolute flex flex-col items-center gap-1.5"
          style={{
            bottom:     '4.2vh',
            left:       '50%',
            translateX: '-50%',
            opacity:    hintOpacity,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <span
            className="tracking-editorial"
            style={{ fontSize: 8, color: 'rgba(138,128,120,0.55)', letterSpacing: '0.2em' }}
          >
            اسکرول کنید
          </span>
          <motion.div
            style={{ width: 1, height: 20, backgroundColor: C.muted, opacity: 0.28 }}
            animate={{ scaleY: [0.28, 1, 0.28] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

      </div>
    </section>
  )
}

// ─── Mobile layout ────────────────────────────────────────────────────────────
function MobileHero() {
  const [playing, setPlaying]       = useState(true)
  const [videoError, setVideoError] = useState(false)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const cardsRef  = useRef<HTMLDivElement>(null)
  const cardsInView = useInView(cardsRef, { once: true, margin: '-40px' })

  function toggle() {
    if (!videoRef.current) return
    playing ? videoRef.current.pause() : videoRef.current.play()
    setPlaying(p => !p)
  }

  return (
    <div className="md:hidden" style={{ backgroundColor: C.bg }} dir="rtl">

      {/* ── Video / image hero ────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ margin: '0 4vw', height: '72vh', borderRadius: 28 }}
      >
        <Image
          src="/images/hero.jpg"
          alt="داروخانه دکتر پویا نانوازاده"
          fill
          className="object-cover"
          priority
        />
        {!videoError && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
            autoPlay muted loop playsInline preload="none"
            onError={() => setVideoError(true)}
          >
            <source src="/videos/hero.mp4"  type="video/mp4" />
            <source src="/videos/hero.webm" type="video/webm" />
          </video>
        )}

        <VideoOverlay />

        {/* Text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ zIndex: 10, padding: '0 8%' }}
        >
          <p
            className="tracking-editorial font-light"
            style={{ fontSize: 9, color: 'rgba(255,255,255,0.46)', letterSpacing: '0.2em', marginBottom: '0.9rem' }}
          >
            داروخانه دکتر پویا نانوازاده
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2rem)', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: '0.28em' }}
          >
            مراقبت روزانه پوست
          </h1>
          <p
            className="font-light"
            style={{ fontSize: 'clamp(0.85rem, 3.2vw, 1.1rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.35, marginBottom: '1.6rem' }}
          >
            با انتخاب تخصصی داروخانه
          </p>
          <div style={{ width: 20, height: 1, backgroundColor: 'rgba(201,130,103,0.48)', margin: '0 auto 1.5rem' }} />
          <Link href="/products?category=skincare">
            <button
              style={{
                padding: '0.55rem 1.5rem',
                border: '1px solid rgba(255,255,255,0.34)',
                color: 'rgba(255,255,255,0.82)',
                fontSize: 11,
                letterSpacing: '0.08em',
                backgroundColor: 'transparent',
              }}
            >
              مشاهده محصولات مراقبت پوست
            </button>
          </Link>
        </div>

        <PlayToggle playing={playing} onClick={toggle} />
      </div>

      {/* ── Transition label ──────────────────────────────────────────── */}
      <div
        className="text-center"
        style={{ padding: '1.6rem 0 1.2rem' }}
        dir="rtl"
      >
        <p style={{ fontSize: 12, color: C.muted, letterSpacing: '0.01em', lineHeight: 1.6 }}>
          برای پوست، مو و سلامت روزانه
        </p>
        <p style={{ fontSize: 10, color: 'rgba(138,128,120,0.5)', marginTop: 4 }}>
          سه مسیر ساده برای انتخاب بهتر
        </p>
      </div>

      {/* ── 3 stacked cards ───────────────────────────────────────────── */}
      <div ref={cardsRef} className="flex flex-col gap-2" style={{ margin: '0 4vw 1.5rem' }}>
        {[
          { type: 'image' as const, src: '/images/cat-skincare.jpg',    title: 'مراقبت پوست',         href: '/products?category=skincare',    delay: 0    },
          { type: 'center' as const,                                                                                                            delay: 0.09 },
          { type: 'image' as const, src: '/images/cat-supplements.jpg', title: 'مکمل‌ها و مراقبت مو',  href: '/products?category=supplements', delay: 0.18 },
        ].map((card, i) => (
          <motion.div
            key={i}
            style={{ aspectRatio: '16/9' }}
            initial={{ opacity: 0, y: 14 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: card.delay, ease: EASE }}
          >
            {card.type === 'image'
              ? <ImageCard src={card.src!} title={card.title!} href={card.href!} />
              : <CenterCard />
            }
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────
export function EditorialVideoHero() {
  return (
    <>
      <DesktopHero />
      <MobileHero />
    </>
  )
}
