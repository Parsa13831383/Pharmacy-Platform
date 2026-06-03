'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ─── Palette — restrained, no vivid colour ───────────────────────────────────
const SAGE  = '#4A5E42'   // deep sage green
const GREY  = '#8A8078'   // warm grey
const TERRA = '#B5704F'   // muted terracotta — used very sparingly

// ─── Icon components ─────────────────────────────────────────────────────────
// All use fill="none" + stroke. strokeLinecap/Join="round" for premium feel.
// Every icon fits a 32×32 or proportional viewBox.

function SerumBottle({ stroke = SAGE, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 28 42" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* Rubber dropper bulb */}
      <ellipse cx="14" cy="4"   rx="3.5" ry="3"   />
      {/* Glass shaft */}
      <line x1="14" y1="7"  x2="14" y2="11.5" />
      {/* Shoulder cap */}
      <rect x="11"  y="11.5" width="6"   height="4"  rx="0.8" />
      {/* Bottle body — slightly tapered, rounded base */}
      <path d="M 11 15.5 L 17 15.5 L 17.5 30 Q 17.5 33.5 14 33.5 Q 10.5 33.5 10.5 30 Z" />
      {/* Liquid level line */}
      <line x1="11.2" y1="25" x2="16.8" y2="25" strokeWidth={sw * 0.55} />
    </svg>
  )
}

function SkinJar({ stroke = GREY, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 36 26" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* Jar body */}
      <rect x="4"  y="12" width="28" height="12" rx="2" />
      {/* Lid */}
      <rect x="3"  y="6.5" width="30" height="6"  rx="1.5" />
      {/* Body–lid seam */}
      <line x1="4" y1="12" x2="32" y2="12" strokeWidth={sw * 0.5} />
      {/* Lid highlight */}
      <line x1="7" y1="9.5" x2="29" y2="9.5" strokeWidth={sw * 0.4} />
    </svg>
  )
}

function WaterDrop({ stroke = SAGE, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 28 36" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* Outer drop */}
      <path d="M 14 3 C 14 3 4 14 4 21 C 4 26.5 8.5 32 14 32 C 19.5 32 24 26.5 24 21 C 24 14 14 3 14 3 Z" />
      {/* Inner highlight — a gentle inner curve */}
      <path d="M 9 18 Q 9.5 13 13.5 10" strokeWidth={sw * 0.5} />
    </svg>
  )
}

function Capsule({ stroke = TERRA, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 36 18" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* Left half (rounded cap) */}
      <path d="M 18 2 L 10 2 Q 2 2 2 9 Q 2 16 10 16 L 18 16 Z" />
      {/* Right half (rounded cap, slightly different) */}
      <path d="M 18 2 L 26 2 Q 34 2 34 9 Q 34 16 26 16 L 18 16 Z" />
      {/* Centre dividing line */}
      <line x1="18" y1="2" x2="18" y2="16" />
    </svg>
  )
}

function LeafShape({ stroke = SAGE, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 30 38" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* Outer leaf silhouette */}
      <path d="M 15 35 C 15 35 4 25 4 15 C 4 8 8.5 3.5 15 3.5 C 21.5 3.5 26 8 26 15 C 26 25 15 35 15 35 Z" />
      {/* Central vein */}
      <line x1="15" y1="3.5" x2="15" y2="35" />
      {/* Side veins */}
      <path d="M 15 14 Q 21 12.5 24 9"   strokeWidth={sw * 0.55} />
      <path d="M 15 14 Q 9  12.5  6  9"  strokeWidth={sw * 0.55} />
      <path d="M 15 20 Q 20 18.5 23 16"  strokeWidth={sw * 0.45} />
      <path d="M 15 20 Q 10 18.5  7 16"  strokeWidth={sw * 0.45} />
    </svg>
  )
}

function Sparkle({ stroke = TERRA, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* 4-pointed star — pointed, minimal */}
      <path d="M 16 3 L 18.8 13.2 L 29 16 L 18.8 18.8 L 16 29 L 13.2 18.8 L 3 16 L 13.2 13.2 Z" />
    </svg>
  )
}

function DiamondGem({ stroke = GREY, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 30 28" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"
    >
      {/* Diamond outline */}
      <path d="M 15 3 L 27 11 L 15 27 L 3 11 Z" />
      {/* Horizontal facet line */}
      <line x1="3" y1="11" x2="27" y2="11" strokeWidth={sw * 0.65} />
      {/* Top facets */}
      <line x1="15" y1="3" x2="9"  y2="11" strokeWidth={sw * 0.5} />
      <line x1="15" y1="3" x2="21" y2="11" strokeWidth={sw * 0.5} />
    </svg>
  )
}

function CircleAtom({ stroke = GREY, sw = 1 }: { stroke?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" width="100%" height="100%"
    >
      {/* Outer ring */}
      <circle cx="16" cy="16" r="12" />
      {/* Inner dot */}
      <circle cx="16" cy="16" r="3"  />
      {/* Orbital ring — slightly tilted ellipse to suggest molecule */}
      <ellipse cx="16" cy="16" rx="12" ry="5"  strokeWidth={sw * 0.55} />
    </svg>
  )
}

// ─── Animated molecule wrapper ────────────────────────────────────────────────
interface MoleculeProps {
  left?: string | number
  right?: string | number
  top?: string | number
  bottom?: string | number
  size?: number
  aspectW?: number
  aspectH?: number
  opacity?: number
  delay?: number
  floatDuration?: number
  floatX?: number
  floatY?: number
  rotateDeg?: number
  className?: string
  children: React.ReactNode
  inView: boolean
  disabled: boolean
}

function Molecule({
  left, right, top, bottom,
  size = 32, aspectW = 1, aspectH = 1,
  opacity = 0.18,
  delay = 0,
  floatDuration = 18,
  floatX = 7,
  floatY = 10,
  rotateDeg = 6,
  className = '',
  children,
  inView,
  disabled,
}: MoleculeProps) {
  const w = size
  const h = Math.round(size * (aspectH / aspectW))

  const floatAnimate = inView && !disabled
    ? {
        opacity,
        scale: 1,
        x: [0,  floatX, -floatX * 0.45, floatX  * 0.28, 0],
        y: [0, -floatY,  floatY * 0.40, -floatY * 0.22, 0],
        rotate: [0, rotateDeg, -rotateDeg * 0.5, rotateDeg * 0.3, 0],
      }
    : disabled
    ? { opacity, scale: 1, x: 0, y: 0, rotate: 0 }
    : { opacity: 0, scale: 0.82, x: 0, y: 0, rotate: 0 }

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ left, right, top, bottom, width: w, height: h }}
      initial={{ opacity: 0, scale: 0.82 }}
      animate={floatAnimate}
      transition={{
        opacity:  { duration: 1.1, delay },
        scale:    { duration: 1.1, delay },
        x: { duration: floatDuration,        repeat: disabled ? 0 : Infinity, ease: 'easeInOut', delay: delay + 1.4, repeatType: 'mirror' },
        y: { duration: floatDuration * 0.88, repeat: disabled ? 0 : Infinity, ease: 'easeInOut', delay: delay + 1.4, repeatType: 'mirror' },
        rotate: { duration: floatDuration * 1.25, repeat: disabled ? 0 : Infinity, ease: 'easeInOut', delay: delay + 1.4, repeatType: 'mirror' },
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── Faint connecting lines between nearby molecules (desktop only) ───────────
// Uses preserveAspectRatio="none" so the viewBox 0-100 maps to percentages.
// Stroke-width of 0.12 in a 0-100 space ≈ 1-2px on typical viewports.
function ConnectingLines({ inView, disabled }: { inView: boolean; disabled: boolean }) {
  const animate = inView && !disabled ? { opacity: 1 } : disabled ? { opacity: 1 } : { opacity: 0 }
  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      initial={{ opacity: 0 }}
      animate={animate}
      transition={{ duration: 2, delay: 2.5 }}
    >
      {/* Serum (top-right ~95,12) → Jar (right-upper ~77,8) */}
      <line x1="93" y1="12" x2="77" y2="8"
        stroke={SAGE} strokeWidth="0.1" opacity="0.20" strokeLinecap="round" />
      {/* Leaf (bottom-left ~8,82) → Diamond (bottom-center ~35,90) */}
      <path d="M 8 82 Q 20 88 35 90"
        stroke={SAGE} strokeWidth="0.1" opacity="0.18" strokeLinecap="round" fill="none" />
      {/* Capsule (mid-left ~5,52) → Atom (mid-left-lower ~5,65) */}
      <line x1="5" y1="52" x2="5" y2="65"
        stroke={GREY} strokeWidth="0.09" opacity="0.15" strokeLinecap="round" />
    </motion.svg>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ProductMoleculesLayer() {
  const ref     = useRef<HTMLDivElement>(null)
  const inView  = useInView(ref, { once: true, amount: 0.1 })
  const disabled = useReducedMotion() ?? false

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ── Faint connecting lines (desktop only) ─────────────────────────── */}
      <ConnectingLines inView={inView} disabled={disabled} />

      {/* ════════════════════════════════════════════════════════════════════
          ALWAYS VISIBLE — mobile + desktop (4 primary molecules)
          Positioned in the far corners so they never overlap the centred quote.
      */}

      {/* Top-right — serum dropper bottle */}
      <Molecule
        right="5%" top="9%"
        size={30} aspectW={28} aspectH={42}
        opacity={0.20} delay={0.3}
        floatDuration={20} floatX={7} floatY={11} rotateDeg={7}
        inView={inView} disabled={disabled}
      >
        <SerumBottle stroke={SAGE} sw={1.05} />
      </Molecule>

      {/* Top-left — water droplet */}
      <Molecule
        left="5%" top="16%"
        size={28} aspectW={28} aspectH={36}
        opacity={0.19} delay={0.7}
        floatDuration={17} floatX={8} floatY={12} rotateDeg={5}
        inView={inView} disabled={disabled}
      >
        <WaterDrop stroke={SAGE} sw={1.0} />
      </Molecule>

      {/* Bottom-left — leaf */}
      <Molecule
        left="5%" bottom="12%"
        size={32} aspectW={30} aspectH={38}
        opacity={0.20} delay={1.1}
        floatDuration={22} floatX={6} floatY={10} rotateDeg={8}
        inView={inView} disabled={disabled}
      >
        <LeafShape stroke={SAGE} sw={1.0} />
      </Molecule>

      {/* Bottom-right — sparkle */}
      <Molecule
        right="5%" bottom="8%"
        size={26}
        opacity={0.18} delay={0.9}
        floatDuration={19} floatX={9} floatY={8} rotateDeg={12}
        inView={inView} disabled={disabled}
      >
        <Sparkle stroke={TERRA} sw={1.05} />
      </Molecule>

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP-ONLY — 6 additional molecules (hidden on mobile)
          Fill the wider negative space around the centred quote.
      */}

      {/* Upper-right cluster — skincare jar (sits further right of top-right serum) */}
      <Molecule
        className="hidden md:block"
        right="22%" top="6%"
        size={32} aspectW={36} aspectH={26}
        opacity={0.17} delay={0.5}
        floatDuration={21} floatX={6} floatY={9} rotateDeg={5}
        inView={inView} disabled={disabled}
      >
        <SkinJar stroke={GREY} sw={1.0} />
      </Molecule>

      {/* Upper-left cluster — capsule */}
      <Molecule
        className="hidden md:block"
        left="18%" top="7%"
        size={28} aspectW={36} aspectH={18}
        opacity={0.16} delay={1.3}
        floatDuration={18} floatX={7} floatY={10} rotateDeg={6}
        inView={inView} disabled={disabled}
      >
        <Capsule stroke={TERRA} sw={1.0} />
      </Molecule>

      {/* Mid-right — atom / molecule circle */}
      <Molecule
        className="hidden md:block"
        right="4%" top="46%"
        size={30}
        opacity={0.15} delay={1.6}
        floatDuration={24} floatX={5} floatY={13} rotateDeg={4}
        inView={inView} disabled={disabled}
      >
        <CircleAtom stroke={GREY} sw={0.95} />
      </Molecule>

      {/* Mid-left — capsule (second, lower) */}
      <Molecule
        className="hidden md:block"
        left="4%" top="50%"
        size={26} aspectW={36} aspectH={18}
        opacity={0.15} delay={2.0}
        floatDuration={20} floatX={8} floatY={9} rotateDeg={7}
        inView={inView} disabled={disabled}
      >
        <Capsule stroke={GREY} sw={0.95} />
      </Molecule>

      {/* Bottom-center-right — diamond gem */}
      <Molecule
        className="hidden md:block"
        right="26%" bottom="7%"
        size={28} aspectW={30} aspectH={28}
        opacity={0.16} delay={1.8}
        floatDuration={19} floatX={7} floatY={10} rotateDeg={9}
        inView={inView} disabled={disabled}
      >
        <DiamondGem stroke={GREY} sw={1.0} />
      </Molecule>

      {/* Bottom-center-left — small serum bottle */}
      <Molecule
        className="hidden md:block"
        left="24%" bottom="6%"
        size={24} aspectW={28} aspectH={42}
        opacity={0.15} delay={2.2}
        floatDuration={23} floatX={6} floatY={11} rotateDeg={6}
        inView={inView} disabled={disabled}
      >
        <SerumBottle stroke={SAGE} sw={0.9} />
      </Molecule>
    </div>
  )
}
