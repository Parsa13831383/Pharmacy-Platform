'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ─── Color ────────────────────────────────────────────────────────────────────
// Deep sage — not vibrant green, deliberately restrained
const SAGE = '#4A5E42'

// ─── Leaf path ────────────────────────────────────────────────────────────────
// Pointed oval, base at origin (0,0), tip at (0, −ry*2).
// The asymmetric bezier control points give it a natural leaf silhouette.
function leafD(rx: number, ry: number): string {
  const h = ry * 2
  return (
    `M 0 0 ` +
    `C ${-rx} ${-ry * 0.48} ${-rx * 0.78} ${-ry * 1.38} 0 ${-h} ` +
    `C ${rx * 0.78} ${-ry * 1.38} ${rx} ${-ry * 0.48} 0 0 Z`
  )
}

// ─── Animated stem ────────────────────────────────────────────────────────────
function DrawPath({
  d,
  strokeWidth = 1.5,
  delay = 0,
  duration = 7,
  opacity = 0.22,
  inView,
  disabled,
}: {
  d: string
  strokeWidth?: number
  delay?: number
  duration?: number
  opacity?: number
  inView: boolean
  disabled: boolean
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={SAGE}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={
        disabled
          ? { pathLength: 1, opacity }
          : inView
          ? { pathLength: 1, opacity }
          : { pathLength: 0, opacity: 0 }
      }
      transition={
        disabled
          ? { duration: 0 }
          : {
              pathLength: { duration, delay, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.8, delay },
            }
      }
    />
  )
}

// ─── Animated floating leaf ───────────────────────────────────────────────────
function FloatLeaf({
  cx,
  cy,
  rx = 4,
  ry = 12,
  rotate = 0,
  opacity = 0.20,
  delay = 0,
  floatDuration = 16,
  floatAmp = 6,
  inView,
  disabled,
}: {
  cx: number
  cy: number
  rx?: number
  ry?: number
  rotate?: number
  opacity?: number
  delay?: number
  floatDuration?: number
  floatAmp?: number
  inView: boolean
  disabled: boolean
}) {
  const d = leafD(rx, ry)
  const animateTarget =
    inView && !disabled
      ? { opacity, y: [0, -floatAmp, floatAmp * 0.55, -floatAmp * 0.4, 0] }
      : disabled
      ? { opacity, y: 0 }
      : { opacity: 0, y: 0 }

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
      <motion.g
        initial={{ opacity: 0, y: 0 }}
        animate={animateTarget}
        transition={{
          opacity: { duration: 1.2, delay },
          y: {
            duration: floatDuration,
            repeat: disabled ? 0 : Infinity,
            ease: 'easeInOut',
            delay: delay + 2,
            repeatType: 'mirror',
          },
        }}
      >
        <path
          d={d}
          fill="none"
          stroke={SAGE}
          strokeWidth={1.05}
          strokeLinejoin="round"
        />
      </motion.g>
    </g>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BotanicalPhilosophyLayer() {
  const ref = useRef<HTMLDivElement>(null)
  // Trigger animations as soon as 10% of the section is in view
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const disabled = useReducedMotion() ?? false

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >

      {/* ══════════════════════════════════════════════════════════════════════
          TOP-RIGHT — primary olive branch
          Flows from top-right corner downward and inward.
          Narrow, alternating-side leaves (olive / bay style).
          Visible on ALL screen sizes — the dominant botanical element.
      */}
      <svg
        className="absolute top-0 right-0 w-44 md:w-72 lg:w-80"
        viewBox="0 0 320 500"
      >
        {/* Main stem */}
        <DrawPath
          d="M 308 0 C 294 72 273 148 250 222 C 227 296 203 364 183 430 C 178 448 175 460 174 478"
          opacity={0.24}
          strokeWidth={1.5}
          duration={8}
          delay={0.3}
          inView={inView}
          disabled={disabled}
        />
        {/* Short twig at top */}
        <DrawPath
          d="M 300 14 C 310 5 318 -2 322 -5"
          opacity={0.15}
          strokeWidth={1.0}
          duration={2}
          delay={1.8}
          inView={inView}
          disabled={disabled}
        />

        {/* Right-side leaves — [cx, cy, rotate, rx, ry, delay, floatDur, floatAmp] */}
        {([
          [297,  30, -38, 4.5, 13,  1.4, 15, 6.5],
          [278,  86, -33, 4.5, 12.5,1.9, 17, 6.0],
          [256, 140, -29, 4.2, 12,  2.4, 16, 5.5],
          [236, 193, -25, 4.0, 11.5,2.9, 18, 5.0],
          [218, 242, -22, 3.8, 11,  3.4, 16, 5.0],
          [203, 288, -19, 3.5, 10.5,3.9, 19, 4.5],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`tr-r-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.22} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}

        {/* Left-side leaves — slightly softer */}
        {([
          [291,  24,  32, 4.2, 12.5, 1.7, 16, 6.0],
          [271,  80,  28, 4.0, 12,   2.2, 18, 5.5],
          [250, 133,  25, 3.8, 11.5, 2.7, 17, 5.0],
          [230, 184,  22, 3.6, 11,   3.2, 19, 4.5],
          [213, 232,  19, 3.4, 10.5, 3.7, 17, 4.5],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`tr-l-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.18} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}
      </svg>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM-LEFT — eucalyptus sprig ascending
          Paired, rounder leaves rising from the lower-left.
          Visible on ALL screen sizes — the secondary botanical element.
      */}
      <svg
        className="absolute bottom-0 left-0 w-40 md:w-64 lg:w-72"
        viewBox="0 0 290 480"
      >
        <DrawPath
          d="M 22 492 C 30 418 50 340 76 265 C 102 190 130 120 148 62 C 153 44 155 27 154 8"
          opacity={0.22}
          strokeWidth={1.5}
          duration={8}
          delay={0.5}
          inView={inView}
          disabled={disabled}
        />

        {/* Paired eucalyptus leaves — rounder, wider */}
        {([
          [ 34, 428,  24, 9.0, 12,   2.0, 18, 5.5],
          [ 50, 421, -26, 9.0, 12,   2.2, 20, 5.5],
          [ 40, 368,  22, 8.5, 11,   2.6, 17, 5.0],
          [ 56, 361, -24, 8.5, 11,   2.8, 19, 5.0],
          [ 50, 308,  20, 8.0, 10.5, 3.2, 18, 4.5],
          [ 66, 301, -22, 8.0, 10.5, 3.4, 21, 4.5],
          [ 60, 250,  18, 7.5, 10,   3.8, 19, 4.0],
          [ 75, 243, -20, 7.5, 10,   4.0, 17, 4.0],
          [ 70, 196,  17, 7.0, 9.5,  4.4, 20, 3.5],
          [ 84, 189, -18, 7.0, 9.5,  4.6, 18, 3.5],
          [ 80, 145,  16, 6.5, 9,    5.0, 19, 3.0],
          [ 93, 138, -16, 6.5, 9,    5.2, 21, 3.0],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`bl-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.20} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}
      </svg>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM-RIGHT — large sweep branch (new element)
          A dramatic branch enters from the bottom-right corner and sweeps
          diagonally toward the upper-center area.
          This is the requested "large subtle branch entering from bottom-right."
          Larger leaves, bolder composition. Hidden on mobile for cleanliness.
      */}
      <svg
        className="absolute bottom-0 right-0 hidden md:block w-72 lg:w-96 xl:w-[480px]"
        viewBox="0 0 380 460"
      >
        {/* Main sweeping stem — bottom-right to upper-center-left */}
        <DrawPath
          d="M 362 465 C 332 390 294 308 250 228 C 206 148 160 80 122 28 C 112 14 105 4 98 -8"
          opacity={0.26}
          strokeWidth={1.6}
          duration={9}
          delay={0.8}
          inView={inView}
          disabled={disabled}
        />
        {/* Secondary branch splitting off mid-stem */}
        <DrawPath
          d="M 250 228 C 270 212 288 200 305 192"
          opacity={0.16}
          strokeWidth={1.0}
          duration={2.5}
          delay={3.5}
          inView={inView}
          disabled={disabled}
        />

        {/* Right side of branch — faces bottom-right */}
        {([
          [340, 392, -52, 5.5, 15.5, 2.0, 15, 7.0],
          [308, 324, -49, 5.5, 15,   2.6, 17, 6.5],
          [272, 259, -46, 5.2, 14.5, 3.2, 16, 6.0],
          [238, 197, -43, 5.0, 14,   3.8, 18, 5.5],
          [205, 139, -40, 4.8, 13.5, 4.4, 16, 5.0],
          [178,  91, -38, 4.5, 13,   5.0, 19, 4.5],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`br-r-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.24} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}

        {/* Left side of branch — faces upper-left */}
        {([
          [330, 381,  36, 5.0, 14.5, 2.3, 16, 6.5],
          [298, 314,  33, 5.0, 14,   2.9, 18, 6.0],
          [262, 249,  30, 4.8, 13.5, 3.5, 17, 5.5],
          [228, 188,  28, 4.5, 13,   4.1, 19, 5.0],
          [196, 130,  25, 4.2, 12.5, 4.7, 17, 4.5],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`br-l-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.20} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}
      </svg>

      {/* ══════════════════════════════════════════════════════════════════════
          TOP-LEFT — descent from top-left, counterbalancing the TR branch
          A slender branch flows from top-left downward toward center-right.
          Tablet and desktop only.
      */}
      <svg
        className="absolute top-0 left-0 hidden md:block w-52 lg:w-64"
        viewBox="0 0 280 460"
      >
        <DrawPath
          d="M 10 0 C 22 58 48 122 78 188 C 108 254 140 318 162 382 C 167 398 170 412 172 428"
          opacity={0.20}
          strokeWidth={1.3}
          duration={8}
          delay={1.0}
          inView={inView}
          disabled={disabled}
        />

        {/* Right side of TL branch */}
        {([
          [ 22,  42, -22, 4.0, 12,   2.2, 18, 5.0],
          [ 40,  95, -19, 3.8, 11.5, 2.8, 17, 4.5],
          [ 60, 150, -17, 3.6, 11,   3.4, 19, 4.5],
          [ 80, 205, -15, 3.4, 10.5, 4.0, 18, 4.0],
          [ 98, 258, -13, 3.2, 10,   4.6, 20, 3.5],
          [116, 308, -12, 3.0, 9.5,  5.2, 18, 3.5],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`tl-r-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.18} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}

        {/* Left side of TL branch */}
        {([
          [ 16,  48,  26, 3.8, 11.5, 2.5, 17, 4.5],
          [ 35, 102,  22, 3.6, 11,   3.1, 19, 4.0],
          [ 55, 157,  20, 3.4, 10.5, 3.7, 18, 4.0],
          [ 74, 212,  18, 3.2, 10,   4.3, 20, 3.5],
          [ 93, 264,  16, 3.0, 9.5,  4.9, 18, 3.0],
        ] as [number,number,number,number,number,number,number,number][]).map(
          ([cx, cy, rot, rx, ry, d, fd, fa], i) => (
            <FloatLeaf key={`tl-l-${i}`}
              cx={cx} cy={cy} rotate={rot} rx={rx} ry={ry}
              opacity={0.15} delay={d} floatDuration={fd} floatAmp={fa}
              inView={inView} disabled={disabled}
            />
          ),
        )}
      </svg>

    </div>
  )
}
