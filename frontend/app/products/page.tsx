'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard } from '@/components/public-product-card'
import { getPublicProducts } from '@/lib/api'
import type { PublicProduct, SortOption } from '@/types/public-product'

const C = {
  bg:     '#FAFAF8',
  bg2:    '#EFE7DA',
  dark:   '#232323',
  muted:  '#6F6A61',
  border: '#E5DED1',
  green:  '#2F7A4D',
  cta:    '#C98267',
  white:  '#FFFFFF',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'قیمت: کم به زیاد' },
  { value: 'price_desc', label: 'قیمت: زیاد به کم' },
]

// ─── Inner content (needs useSearchParams) ────────────────────────────────────
function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch]   = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [sort, setSort]       = useState<SortOption>((searchParams.get('sort') as SortOption | null) ?? 'newest')

  const [allProducts, setAllProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    getPublicProducts()
      .then(setAllProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of allProducts) {
      if (p.category) map.set(p.category.slug, p.category.name)
    }
    return [...map.entries()].map(([slug, name]) => ({ slug, name }))
  }, [allProducts])

  const displayed = useMemo(() => {
    let result = [...allProducts]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q),
      )
    }
    if (category) result = result.filter(p => p.category?.slug === category)
    if (sort === 'price_asc') result.sort((a, b) => Number(a.discountedPrice ?? a.price) - Number(b.discountedPrice ?? b.price))
    else if (sort === 'price_desc') result.sort((a, b) => Number(b.discountedPrice ?? b.price) - Number(a.discountedPrice ?? a.price))
    else result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return result
  }, [allProducts, search, category, sort])

  function pushURL(s: string, cat: string, srt: SortOption) {
    const params = new URLSearchParams()
    if (s) params.set('search', s)
    if (cat) params.set('category', cat)
    if (srt !== 'newest') params.set('sort', srt)
    const qs = params.toString()
    router.replace(`/products${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => pushURL(value, category, sort), 400)
  }

  function handleCategory(slug: string) {
    setCategory(slug)
    pushURL(search, slug, sort)
    setDrawerOpen(false)
  }

  function handleSort(value: SortOption) {
    setSort(value)
    pushURL(search, category, value)
  }

  function clearFilters() {
    setSearch('')
    setCategory('')
    setSort('newest')
    router.replace('/products', { scroll: false })
  }

  const hasFilters = !!search || !!category

  // ── Sidebar filter list ────────────────────────────────────────────────────
  function FilterList() {
    return (
      <div className="space-y-1">
        <button
          onClick={() => handleCategory('')}
          className="w-full text-right px-3 py-2.5 text-sm transition-colors"
          style={{
            color: !category ? C.dark : C.muted,
            fontWeight: !category ? 600 : 400,
            backgroundColor: !category ? C.bg2 : 'transparent',
            borderRadius: '3px',
          }}
        >
          همه محصولات
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => handleCategory(cat.slug)}
            className="w-full text-right px-3 py-2.5 text-sm transition-colors"
            style={{
              color: category === cat.slug ? C.dark : C.muted,
              fontWeight: category === cat.slug ? 600 : 400,
              backgroundColor: category === cat.slug ? C.bg2 : 'transparent',
              borderRadius: '3px',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }} dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <section
          className="py-6 md:py-16"
          style={{ backgroundColor: C.bg2, borderBottom: `1px solid ${C.border}` }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <p className="text-xs tracking-editorial mb-3" style={{ color: C.green }}>مجموعه کامل</p>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: C.dark, letterSpacing: '-0.02em' }}>
              همه محصولات
            </h1>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs tracking-editorial mb-4" style={{ color: C.muted }}>دسته‌بندی</p>
                <FilterList />
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div
                  className="relative flex-1 flex items-center"
                  style={{ border: `1px solid ${C.border}`, borderRadius: '3px', backgroundColor: C.white }}
                >
                  <Search className="absolute right-3 w-4 h-4 pointer-events-none" strokeWidth={1.5} style={{ color: C.muted }} />
                  <input
                    type="text"
                    placeholder="جستجوی محصولات..."
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="w-full pl-3 pr-9 py-3 text-sm bg-transparent outline-none"
                    style={{ color: C.dark }}
                  />
                </div>

                <div className="flex gap-2 shrink-0">
                  <select
                    value={sort}
                    onChange={e => handleSort(e.target.value as SortOption)}
                    className="px-3 py-3 text-sm outline-none"
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: '3px',
                      backgroundColor: C.white,
                      color: C.dark,
                    }}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-4 py-3 text-sm border"
                    style={{ border: `1px solid ${C.border}`, borderRadius: '3px', color: C.dark, backgroundColor: C.white }}
                  >
                    <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                    فیلتر
                  </button>
                </div>
              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {category && (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
                      style={{ backgroundColor: C.bg2, color: C.dark, borderRadius: '3px' }}
                    >
                      {categories.find(c => c.slug === category)?.name ?? category}
                      <button onClick={() => handleCategory('')}><X className="w-3 h-3" strokeWidth={2} /></button>
                    </span>
                  )}
                  {search && (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
                      style={{ backgroundColor: C.bg2, color: C.dark, borderRadius: '3px' }}
                    >
                      جستجو: {search}
                      <button onClick={() => handleSearchChange('')}><X className="w-3 h-3" strokeWidth={2} /></button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-xs transition-colors" style={{ color: C.muted }}>
                    پاک کردن همه
                  </button>
                </div>
              )}

              {/* Count */}
              {!loading && !error && (
                <p className="text-sm mb-6" style={{ color: C.muted }}>
                  {displayed.length.toLocaleString('fa-IR')} محصول
                </p>
              )}

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="rounded-sm mb-4" style={{ aspectRatio: '3/4', backgroundColor: C.bg2 }} />
                      <div className="space-y-2">
                        <div className="h-2 rounded" style={{ backgroundColor: C.border, width: '40%' }} />
                        <div className="h-3 rounded" style={{ backgroundColor: C.border, width: '80%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-24 border" style={{ borderColor: C.border, borderRadius: '4px' }}>
                  <p className="text-sm mb-4" style={{ color: C.muted }}>خطا در دریافت محصولات</p>
                  <button onClick={() => window.location.reload()} className="text-sm underline" style={{ color: C.dark }}>
                    تلاش مجدد
                  </button>
                </div>
              ) : displayed.length === 0 ? (
                <div className="text-center py-24 border" style={{ borderColor: C.border, borderRadius: '4px' }}>
                  <p className="text-sm mb-4" style={{ color: C.muted }}>محصولی یافت نشد</p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-sm underline" style={{ color: C.dark }}>
                      پاک کردن فیلترها
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {displayed.map((p, i) => (
                    <PublicProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: 'rgba(35,35,35,0.4)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-72 z-50 overflow-y-auto p-6 shadow-xl lg:hidden"
              style={{ backgroundColor: C.white }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-base" style={{ color: C.dark }}>فیلترها</h2>
                <button onClick={() => setDrawerOpen(false)} style={{ color: C.muted }}>
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-xs tracking-editorial mb-3" style={{ color: C.muted }}>دسته‌بندی</p>
              <FilterList />
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 text-sm font-medium text-white mt-6"
                style={{ backgroundColor: C.dark, borderRadius: '3px' }}
              >
                اعمال فیلتر
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E5DED1', borderTopColor: '#232323' }} />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
