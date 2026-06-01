'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onComplete?: () => void
}

export function LoadingScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 1900)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F6F1',
        gap: 26,
      }}
    >
      {/* Ambient botanical glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.35 }}
        animate={{ opacity: 0.2, scale: 1.1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(107,158,107,0.75) 0%, transparent 62%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Botanical leaf illustration */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox="0 0 80 100"
          width="88"
          height="110"
          style={{
            display: 'block',
            filter: 'drop-shadow(0 8px 30px rgba(75,125,80,0.22))',
          }}
        >
          {/* Leaf fill — appears as outline finishes drawing */}
          <motion.path
            d="M 40 75 C 34 65 22 52 20 38 C 18 24 26 12 40 10 C 54 12 62 24 60 38 C 58 52 46 65 40 75 Z"
            fill="#7FA882"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 0.87, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.8, ease: 'easeOut' }}
            style={{ transformOrigin: '40px 42px' }}
          />

          {/* Leaf outline — draws itself from base to tip and back */}
          <motion.path
            d="M 40 75 C 34 65 22 52 20 38 C 18 24 26 12 40 10 C 54 12 62 24 60 38 C 58 52 46 65 40 75 Z"
            fill="none"
            stroke="#4A7A52"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          {/* Center vein */}
          <motion.path
            d="M 40 75 C 40 56 40 33 40 10"
            fill="none"
            stroke="#3A6448"
            strokeWidth="0.9"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{
              pathLength: { duration: 0.45, delay: 1.0 },
              opacity: { duration: 0.08, delay: 1.0 },
            }}
          />

          {/* Side veins — subtle organic texture */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            transition={{ duration: 0.35, delay: 1.22 }}
          >
            <path
              d="M 40 44 C 32 41 25 40 21 42"
              stroke="#3A6448"
              strokeWidth="0.72"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 40 44 C 48 41 55 40 59 42"
              stroke="#3A6448"
              strokeWidth="0.72"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 40 58 C 33 55 27 53 24 55"
              stroke="#3A6448"
              strokeWidth="0.62"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 40 58 C 47 55 53 53 56 55"
              stroke="#3A6448"
              strokeWidth="0.62"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Seed — first element to appear */}
          <motion.ellipse
            cx={40}
            cy={87}
            rx={4.5}
            ry={6}
            fill="#8B7050"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.34, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: '40px 87px' }}
          />

          {/* Short stem connecting seed to leaf */}
          <motion.path
            d="M 40 81 L 40 76"
            stroke="#5A7A52"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{
              pathLength: { duration: 0.18, delay: 0.2 },
              opacity: { duration: 0.05, delay: 0.2 },
            }}
          />
        </svg>
      </div>

      {/* Progress line — fills right to left (RTL) */}
      <div
        style={{
          width: 148,
          height: 1.5,
          backgroundColor: 'rgba(176, 171, 158, 0.45)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#6B9E70',
            borderRadius: 4,
            originX: 1,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.62,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>

      {/* Persian tagline — fades in as progress completes */}
      <motion.p
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.52, delay: 1.42, ease: 'easeOut' }}
        style={{
          fontFamily: "'Vazirmatn', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 300,
          color: '#526A55',
          letterSpacing: '0.03em',
          direction: 'rtl',
          margin: 0,
          marginTop: -8,
        }}
      >
        زیبایی طبیعی، سلامت پایدار
      </motion.p>
    </motion.div>
  )
}
