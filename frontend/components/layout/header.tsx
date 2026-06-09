'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import { PremiumNavigationDrawer } from './premium-navigation-drawer'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')
  const triggerRef                  = useRef<HTMLButtonElement>(null)
  const { totalItems }              = useCart()
  const router                      = useRouter()

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  function closeDrawer() { setDrawerOpen(false) }
  function openDrawer()  { setDrawerOpen(true)  }

  return (
    <>
      <header
        className="sticky top-0"
        style={{
          zIndex: 50,
          backgroundColor: 'rgba(250,250,248,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5DED1',
        }}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* ── Brand name ────────────────────────────────────── */}
            <Link
              href="/"
              className="font-bold leading-tight shrink-0"
              style={{ color: '#1C1A18', fontSize: 16, letterSpacing: '-0.025em' }}
            >
              داروخانه سبز
            </Link>

            {/* ── Actions ───────────────────────────────────────── */}
            <div className="flex items-center gap-0.5">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="جستجو"
                className="w-10 h-10 flex items-center justify-center transition-colors"
                style={{ color: '#8A8078', borderRadius: 2 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1C1A18')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8078')}
              >
                <Search className="w-4.5 h-4.5" strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`سبد خرید — ${totalItems} مورد`}
                className="relative w-10 h-10 flex items-center justify-center transition-colors"
                style={{ color: '#8A8078' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1C1A18')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8078')}
              >
                <ShoppingBag className="w-4.5 h-4.5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span
                    className="absolute top-1.5 left-1.5 flex items-center justify-center font-bold text-white"
                    style={{
                      width: 15,
                      height: 15,
                      fontSize: 9,
                      borderRadius: '50%',
                      backgroundColor: '#C98267',
                    }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Hamburger — opens premium drawer */}
              <button
                ref={triggerRef}
                onClick={openDrawer}
                aria-label="باز کردن منو"
                aria-expanded={drawerOpen}
                aria-controls="nav-drawer"
                className="w-10 h-10 flex items-center justify-center transition-colors"
                style={{ color: '#8A8078', borderRadius: 2 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1C1A18')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8078')}
              >
                <Menu className="w-4.5 h-4.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Premium navigation drawer ──────────────────────────── */}
      <PremiumNavigationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        triggerRef={triggerRef}
      />

      {/* ── Search overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 flex items-start justify-center pt-24 px-4"
            style={{ zIndex: 80, backgroundColor: 'rgba(20,17,14,0.52)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_ENTER } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
              className="w-full max-w-xl bg-white overflow-hidden"
              style={{ borderRadius: 3, boxShadow: '0 24px 80px rgba(20,17,14,0.22)' }}
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="جستجوی محصولات..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 px-6 py-4 text-sm bg-transparent outline-none"
                  style={{ color: '#1C1A18' }}
                  dir="rtl"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-4 text-sm font-medium text-white shrink-0"
                  style={{ backgroundColor: '#C98267' }}
                >
                  جستجو
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
