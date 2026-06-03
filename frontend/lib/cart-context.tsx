'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, PublicProduct } from '@/types/public-product'

export type { CartItem }

interface CartContextType {
  items: CartItem[]
  addItem: (product: PublicProduct, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'green-pharmacy-cart'

function cartItemFromProduct(product: PublicProduct, quantity: number): CartItem {
  const effectivePrice = product.discountedPrice
    ? Number(product.discountedPrice)
    : Number(product.price)
  const primaryImg =
    product.images?.find(img => img.isPrimary) ?? product.images?.[0] ?? null
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: effectivePrice,
    originalPrice: product.discountedPrice ? Number(product.price) : null,
    brand: product.brand,
    categoryName: product.category?.name ?? null,
    quantity,
    stock: product.stockQuantity,
    imageUrl: primaryImg?.imageUrl ?? null,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage once on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored) as CartItem[])
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  const addItem = useCallback((product: PublicProduct, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        const next = Math.min(existing.quantity + quantity, existing.stock || Infinity)
        return prev.map(i => (i.id === product.id ? { ...i, quantity: next } : i))
      }
      return [...prev, cartItemFromProduct(product, Math.min(quantity, product.stockQuantity || 1))]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        return { ...i, quantity: Math.min(quantity, i.stock || quantity) }
      }),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
