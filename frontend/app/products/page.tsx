'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PublicProductCard } from '@/components/public-product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getPublicProducts } from '@/lib/api'
import type { PublicProduct, SortOption } from '@/types/public-product'

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'قیمت کم به زیاد' },
  { value: 'price_desc', label: 'قیمت زیاد به کم' },
]

// ─── Inner content (needs useSearchParams — wrapped in Suspense) ──────────────

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── State synced with URL ──────────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption | null) ?? 'newest',
  )

  // ── Products & categories ──────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Mobile filter drawer ───────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Debounce search ────────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch all products on mount; subsequent filter/sort is client-side
  useEffect(() => {
    setLoading(true)
    setError('')
    getPublicProducts()
      .then(setAllProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived category list from fetched products ────────────────────────────
  const categories = useMemo(() => {
    const map = new Map<string, string>() // slug → name
    for (const p of allProducts) {
      if (p.category) map.set(p.category.slug, p.category.name)
    }
    return [...map.entries()].map(([slug, name]) => ({ slug, name }))
  }, [allProducts])

  // ── Client-side filter + sort ──────────────────────────────────────────────
  const displayed = useMemo(() => {
    let result = [...allProducts]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q),
      )
    }

    if (category) {
      result = result.filter(p => p.category?.slug === category)
    }

    if (sort === 'price_asc') {
      result.sort((a, b) => Number(a.discountedPrice ?? a.price) - Number(b.discountedPrice ?? b.price))
    } else if (sort === 'price_desc') {
      result.sort((a, b) => Number(b.discountedPrice ?? b.price) - Number(a.discountedPrice ?? a.price))
    } else {
      result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }

    return result
  }, [allProducts, search, category, sort])

  // ── Update URL to reflect current filters ─────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <section className="bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 py-10 md:py-14 border-b border-slate-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">محصولات</h1>
              <p className="text-slate-500">
                محصول مورد نیاز خود را جستجو و انتخاب کنید.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Desktop sidebar ──────────────────────────────────────────── */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-4 text-sm">دسته‌بندی</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategory('')}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                        !category
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      همه محصولات
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategory(cat.slug)}
                        className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                          category === cat.slug
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="جستجوی محصولات..."
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="h-10 pr-9"
                  />
                </div>

                {/* Sort + mobile filter */}
                <div className="flex gap-2 shrink-0">
                  <select
                    value={sort}
                    onChange={e => handleSort(e.target.value as SortOption)}
                    className="h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden h-10 rounded-xl gap-1.5"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    فیلتر
                  </Button>
                </div>
              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {category && (
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                      {categories.find(c => c.slug === category)?.name ?? category}
                      <button onClick={() => handleCategory('')} aria-label="حذف فیلتر دسته">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                      جستجو: {search}
                      <button onClick={() => handleSearchChange('')} aria-label="پاک کردن جستجو">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2"
                  >
                    پاک کردن همه
                  </button>
                </div>
              )}

              {/* Products count */}
              {!loading && !error && (
                <p className="text-sm text-muted-foreground mb-5">
                  {displayed.length.toLocaleString('fa-IR')} محصول یافت شد
                </p>
              )}

              {/* Content states */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-card rounded-2xl border border-border/40 overflow-hidden animate-pulse"
                    >
                      <div className="aspect-4/3 bg-muted" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-4/5" />
                        <div className="h-4 bg-muted rounded w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">خطا در دریافت محصولات</p>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => window.location.reload()}
                  >
                    تلاش مجدد
                  </Button>
                </div>
              ) : displayed.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground mb-4">محصولی یافت نشد</p>
                  {hasFilters && (
                    <Button variant="outline" className="rounded-xl" onClick={clearFilters}>
                      پاک کردن فیلترها
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {displayed.map((product, i) => (
                    <PublicProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile filter drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-card z-50 p-6 overflow-y-auto shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">فیلترها</h2>
                <button onClick={() => setDrawerOpen(false)} aria-label="بستن فیلتر">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <h3 className="font-semibold text-sm text-foreground mb-3">دسته‌بندی</h3>
              <div className="space-y-1 mb-6">
                <button
                  onClick={() => handleCategory('')}
                  className={`w-full text-right px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    !category
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  همه محصولات
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategory(cat.slug)}
                    className={`w-full text-right px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      category === cat.slug
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <Button className="w-full rounded-xl" onClick={() => setDrawerOpen(false)}>
                اعمال فیلتر
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

// ─── Page export (Suspense required for useSearchParams) ─────────────────────

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" dir="rtl">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
