'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, FileText, MessageSquare, ShieldCheck, Truck, X } from 'lucide-react'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#FAFAF8',
  bg2:    '#EFE7DA',
  dark:   '#1C1A18',
  muted:  '#8A8078',
  border: '#E5DED1',
  green:  '#2F7A4D',
  white:  '#FFFFFF',
}

// ─── Nav data ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/',                              label: 'خانه',              chevron: false },
  { href: '/products',                      label: 'محصولات',            chevron: true  },
  { href: '/products?category=skincare',    label: 'مراقبت پوست',        chevron: true  },
  { href: '/products?category=hair-care',   label: 'مراقبت مو',          chevron: true  },
  { href: '/products?category=supplements', label: 'مکمل‌ها',            chevron: true  },
  { href: '/products?category=cosmetics',   label: 'آرایشی و بهداشتی',   chevron: false },
  { href: '/track-order',                   label: 'ثبت نسخه آنلاین',    chevron: false },
  { href: '/track-order',                   label: 'پیگیری سفارش',       chevron: false },
  { href: '#about',                         label: 'درباره داروخانه',    chevron: false },
  { href: '#contact',                       label: 'تماس با ما',         chevron: false },
]

const SERVICES = [
  { Icon: MessageSquare, label: 'مشاوره تخصصی'    },
  { Icon: Truck,         label: 'ارسال سریع'       },
  { Icon: ShieldCheck,   label: 'تضمین اصالت کالا' },
  { Icon: FileText,      label: 'ثبت نسخه آنلاین'  },
]

// ─── Variants ─────────────────────────────────────────────────────────────────
const overlayV = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.3,  ease: 'easeIn', delay: 0.1 } },
}

const drawerV = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const } },
  exit:    { x: '100%', transition: { duration: 0.46, ease: [0.4, 0, 1, 1] as const } },
}

const listV = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
  exit:    {},
}

const itemV = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.44, ease: [0.16, 1, 0.3, 1] as const } },
  exit:    { opacity: 0,        transition: { duration: 0.18 } },
}

const fadeInV = (delay: number) => ({
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, delay, ease: [0.16, 1, 0.3, 1] as const } },
  exit:    { opacity: 0,       transition: { duration: 0.18 } },
})

// ─── PremiumNavigationDrawer ──────────────────────────────────────────────────
export function PremiumNavigationDrawer({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const noAnim = useReducedMotion() ?? false

  // Portal mount guard
  useEffect(() => setMounted(true), [])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Return focus to trigger on close
  useEffect(() => {
    if (!open) triggerRef.current?.focus()
  }, [open, triggerRef])

  // ESC + focus trap
  useEffect(() => {
    if (!open) return

    const el = drawerRef.current
    if (!el) return

    const nodes = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    )
    const first = nodes[0]
    const last  = nodes[nodes.length - 1]

    // Move focus inside drawer on open
    setTimeout(() => first?.focus(), 50)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  // Instant transitions for prefers-reduced-motion
  const instant = { duration: 0 }
  const oV = noAnim ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: instant }, exit: { opacity: 0, transition: instant } } : overlayV
  const dV = noAnim ? { hidden: { x: '100%' }, visible: { x: 0,     transition: instant }, exit: { x: '100%', transition: instant } } : drawerV
  const lV = noAnim ? {} : listV
  const iV = noAnim ? {} : itemV
  const fi = (d: number) => noAnim ? {} : fadeInV(d)

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ────────────────────────────────────────────── */}
          <motion.div
            key="overlay"
            variants={oV}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden="true"
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              backgroundColor: 'rgba(20, 17, 14, 0.48)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          />

          {/* ── Drawer panel ────────────────────────────────────────── */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="منوی ناوبری"
            variants={dV}
            initial="hidden"
            animate="visible"
            exit="exit"
            dir="rtl"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(490px, 92vw)',
              zIndex: 75,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              backgroundColor: C.bg,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: '-28px 0 88px rgba(20,17,14,0.18), -2px 0 12px rgba(20,17,14,0.06)',
            }}
          >

            {/* ── Header row ──────────────────────────────────────── */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{ padding: '1.4rem 1.75rem', borderBottom: `1px solid ${C.border}` }}
            >
              {/* Brand name */}
              <Link
                href="/"
                onClick={onClose}
                className="font-bold leading-tight"
                style={{ color: C.dark, fontSize: 15, letterSpacing: '-0.025em' }}
              >
                داروخانه دکتر پویا نانوازاده
              </Link>

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="بستن منو"
                className="shrink-0 flex items-center justify-center transition-colors"
                style={{
                  width: 34,
                  height: 34,
                  marginRight: 'auto',
                  marginLeft: '1rem',
                  border: `1px solid ${C.border}`,
                  borderRadius: 2,
                  color: C.muted,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.dark)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Navigation links ────────────────────────────────── */}
            <motion.nav
              aria-label="پیمایش اصلی"
              variants={lV}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col"
              style={{ padding: '0.5rem 0' }}
            >
              {NAV_ITEMS.map(({ href, label, chevron }, i) => (
                <motion.div key={`${href}-${i}`} variants={iV}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="flex items-center justify-between group"
                    style={{
                      padding: '0.875rem 1.75rem',
                      borderBottom: `1px solid ${C.border}`,
                      color: C.dark,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F0E8' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  >
                    <span
                      style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.4 }}
                    >
                      {label}
                    </span>
                    {chevron && (
                      <ChevronLeft
                        className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                        strokeWidth={1.3}
                        style={{ color: 'rgba(110,104,97,0.5)' }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* ── Info card ───────────────────────────────────────── */}
            <motion.div
              variants={fi(0.52)}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ padding: '1.5rem 1.75rem', borderTop: `1px solid ${C.border}` }}
            >
              <div
                style={{
                  backgroundColor: C.bg2,
                  border: `1px solid ${C.border}`,
                  borderRadius: 3,
                  padding: '1.1rem 1.25rem',
                }}
              >
                <p
                  className="font-semibold mb-1.5"
                  style={{ fontSize: 13, color: C.dark, letterSpacing: '-0.015em' }}
                >
                  سفارش بدون ثبت‌نام
                </p>
                <p
                  style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}
                >
                  با تایید شماره موبایل، سریع و امن خرید کنید.
                </p>
              </div>
            </motion.div>

            {/* ── Services ────────────────────────────────────────── */}
            <motion.div
              variants={fi(0.62)}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ padding: '1.25rem 1.75rem 2.5rem', borderTop: `1px solid ${C.border}` }}
            >
              <p
                className="tracking-editorial font-medium mb-4"
                style={{ fontSize: 10, color: C.muted, letterSpacing: '0.12em' }}
              >
                خدمات داروخانه
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {SERVICES.map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} style={{ color: C.green }} />
                    <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
