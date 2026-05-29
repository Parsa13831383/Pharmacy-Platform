'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Filter, Grid3X3, LayoutList, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { products, categories, searchProducts, getProductsByCategory } from '@/lib/products'

function ProductsContent() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  const searchQuery = searchParams.get('search')
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...products]
    
    // Search filter
    if (searchQuery) {
      result = searchProducts(searchQuery)
    }
    
    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.categorySlug === selectedCategory)
    }
    
    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'bestsellers':
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
        break
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }
    
    return result
  }, [searchQuery, selectedCategory, priceRange, sortBy])

  const currentCategory = categories.find(c => c.slug === selectedCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {searchQuery 
                  ? `نتایج جستجو: "${searchQuery}"`
                  : currentCategory 
                    ? currentCategory.name 
                    : 'همه محصولات'
                }
              </h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} محصول یافت شد
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">دسته‌بندی</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                        !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      همه محصولات
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === cat.slug ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {cat.name}
                        <span className="text-xs opacity-60 mr-2">({cat.productCount})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-card rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">محدوده قیمت</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="از"
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="text-center"
                      />
                      <Input
                        type="number"
                        placeholder="تا"
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="text-center"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'زیر ۵۰۰ هزار', range: [0, 500000] },
                        { label: '۵۰۰ - ۱ میلیون', range: [500000, 1000000] },
                        { label: 'بالای ۱ میلیون', range: [1000000, 10000000] },
                      ].map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => setPriceRange(preset.range as [number, number])}
                          className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden rounded-xl"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4 ml-2" />
                    فیلتر
                  </Button>
                  
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-card border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="newest">جدیدترین</option>
                    <option value="bestsellers">پرفروش‌ترین</option>
                    <option value="price-low">ارزان‌ترین</option>
                    <option value="price-high">گران‌ترین</option>
                    <option value="rating">بالاترین امتیاز</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center gap-1 bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                      {currentCategory?.name}
                      <button onClick={() => setSelectedCategory(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                      جستجو: {searchQuery}
                    </span>
                  )}
                </div>
              )}

              {/* Products */}
              {filteredProducts.length > 0 ? (
                <div className={`grid gap-4 md:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">محصولی یافت نشد</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null)
                      setPriceRange([0, 3000000])
                    }}
                    className="rounded-xl"
                  >
                    پاک کردن فیلترها
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-foreground/50"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-card p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">فیلترها</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-bold text-foreground mb-4">دسته‌بندی</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setIsFilterOpen(false)
                    }}
                    className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    همه محصولات
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.slug ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-bold text-foreground mb-4">محدوده قیمت</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="از"
                      value={priceRange[0]}
                      onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="text-center"
                    />
                    <Input
                      type="number"
                      placeholder="تا"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full rounded-xl"
                onClick={() => setIsFilterOpen(false)}
              >
                اعمال فیلترها
              </Button>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
