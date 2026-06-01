'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LoadingScreen } from './loading-screen'

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
  }, [])

  return (
    <>
      <AnimatePresence>
        {loading && (
          <LoadingScreen
            key="loading-screen"
            onComplete={() => setLoading(false)}
          />
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
