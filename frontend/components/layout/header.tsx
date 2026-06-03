'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات' },
  { href: '/track-order', label: 'پیگیری سفارش' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { totalItems } = useCart()
  const router = useRouter()

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm"
        style={{ borderBottom: '1px solid #E5DED1' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: '#232323', letterSpacing: '-0.02em' }}
              >
                داروخانه سبز
              </span>
            </Link>

            {/* Desktop Nav — centered */}
            <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors duration-200"
                  style={{ color: '#6F6A61', letterSpacing: '0.01em' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#232323' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6F6A61' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-11 h-11 flex items-center justify-center rounded-full transition-colors"
                style={{ color: '#6F6A61' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#232323' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6F6A61' }}
                aria-label="جستجو"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative w-11 h-11 flex items-center justify-center rounded-full transition-colors" style={{ color: '#6F6A61' }}>
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full text-white"
                    style={{ backgroundColor: '#C98267' }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-full"
                style={{ color: '#6F6A61' }}
                aria-label="منو"
              >
                {menuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-background"
              style={{ borderTop: '1px solid #E5DED1' }}
            >
              <nav className="flex flex-col max-w-7xl mx-auto px-4 py-2 gap-0">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="py-4 px-4 text-base font-medium transition-colors"
                    style={{ color: '#232323', borderBottom: '1px solid #F0EBE2' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-start justify-center pt-24 px-4"
            style={{ backgroundColor: 'rgba(35, 35, 35, 0.5)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-xl bg-white shadow-xl"
              style={{ borderRadius: '4px' }}
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-0">
                <input
                  type="text"
                  placeholder="جستجوی محصولات..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 px-6 py-4 text-sm bg-transparent outline-none"
                  style={{ color: '#232323' }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-4 text-sm font-medium transition-colors text-white"
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
