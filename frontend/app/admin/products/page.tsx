'use client'

import { useEffect, useRef, useState } from 'react'
import { Edit2, Image as ImageIcon, Plus, Power, PowerOff, Star, Trash2, Bookmark, BookmarkCheck } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createProduct,
  deactivateProduct,
  deleteProductImage,
  getAdminCategories,
  getAdminProducts,
  getProductImages,
  setProductImagePrimary,
  toggleAdminProductFeatured,
  updateProduct,
  uploadProductImage,
} from '@/lib/api'
import { getMediaUrl } from '@/lib/media'
import type { Category } from '@/types/category'
import type { Product, ProductImage } from '@/types/product'

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  slug: string
  price: string
  discountedPrice: string
  categoryId: string
  brand: string
  sku: string
  description: string
  stockQuantity: string
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  price: '',
  discountedPrice: '',
  categoryId: '',
  brand: '',
  sku: '',
  description: '',
  stockQuantity: '',
}

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    slug: p.slug,
    price: p.price.toString(),
    discountedPrice: p.discountedPrice?.toString() ?? '',
    categoryId: p.categoryId ?? '',
    brand: p.brand ?? '',
    sku: p.sku ?? '',
    description: p.description ?? '',
    stockQuantity: p.stockQuantity.toString(),
  }
}

function validateSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug)
}

function fmtPrice(n: number) {
  return n.toLocaleString('fa-IR')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [actionId, setActionId] = useState<string | null>(null)
  const [featuredId, setFeaturedId] = useState<string | null>(null)

  // Image management dialog
  const [imageProduct, setImageProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [imageDialogLoading, setImageDialogLoading] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([getAdminProducts(), getAdminCategories()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(cats)
      })
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Create / Edit dialog ───────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditTarget(product)
    setForm(productToForm(product))
    setFormError('')
    setDialogOpen(true)
  }

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = form.name.trim()
    const slug = form.slug.trim()
    const priceRaw = form.price.trim()
    const discRaw = form.discountedPrice.trim()
    const stockRaw = form.stockQuantity.trim()

    if (!name) { setFormError('نام محصول الزامی است'); return }
    if (!slug) { setFormError('اسلاگ الزامی است'); return }
    if (!validateSlug(slug)) {
      setFormError('اسلاگ فقط شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد')
      return
    }
    if (!priceRaw) { setFormError('قیمت الزامی است'); return }

    const price = parseFloat(priceRaw)
    if (isNaN(price) || price <= 0) { setFormError('قیمت باید عددی بزرگتر از صفر باشد'); return }

    let discountedPrice: number | undefined
    if (discRaw) {
      discountedPrice = parseFloat(discRaw)
      if (isNaN(discountedPrice) || discountedPrice <= 0) {
        setFormError('قیمت تخفیف‌دار باید عددی بزرگتر از صفر باشد')
        return
      }
      if (discountedPrice >= price) {
        setFormError('قیمت تخفیف‌دار باید کمتر از قیمت اصلی باشد')
        return
      }
    }

    let stockQuantity: number | undefined
    if (stockRaw) {
      stockQuantity = parseInt(stockRaw, 10)
      if (isNaN(stockQuantity) || stockQuantity < 0) {
        setFormError('موجودی نمی‌تواند منفی باشد')
        return
      }
    }

    setSubmitting(true)
    setFormError('')
    try {
      const input = {
        name,
        slug,
        price,
        ...(discountedPrice !== undefined && { discountedPrice }),
        ...(form.categoryId && { categoryId: form.categoryId }),
        ...(form.brand.trim() && { brand: form.brand.trim() }),
        ...(form.sku.trim() && { sku: form.sku.trim() }),
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(stockQuantity !== undefined && { stockQuantity }),
      }

      if (editTarget) {
        const updated = await updateProduct(editTarget.id, input)
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createProduct(input)
        setProducts(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate(id: string) {
    setActionId(id)
    try {
      const updated = await deactivateProduct(id)
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      // silently fail
    } finally {
      setActionId(null)
    }
  }

  async function handleActivate(id: string) {
    setActionId(id)
    try {
      const updated = await updateProduct(id, { isActive: true })
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      // silently fail
    } finally {
      setActionId(null)
    }
  }

  async function handleToggleFeatured(id: string) {
    setFeaturedId(id)
    try {
      const updated = await toggleAdminProductFeatured(id)
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      // silently fail
    } finally {
      setFeaturedId(null)
    }
  }

  // ── Image management dialog ────────────────────────────────────────────────

  async function openImageDialog(product: Product) {
    setImageProduct(product)
    setUploadError('')
    setImageDialogLoading(true)
    try {
      const imgs = await getProductImages(product.id)
      setImages(imgs)
    } catch {
      setImages(product.images ?? [])
    } finally {
      setImageDialogLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !imageProduct) return
    setUploading(true)
    setUploadError('')
    try {
      const img = await uploadProductImage(imageProduct.id, file, images.length === 0)
      setImages(prev => [...prev, img])
      // refresh product list to update primary image shown in table
      const updated = await getAdminProducts()
      setProducts(updated)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'خطا در آپلود')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!imageProduct) return
    setDeletingImageId(imageId)
    try {
      await deleteProductImage(imageProduct.id, imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch {
      // silently fail
    } finally {
      setDeletingImageId(null)
    }
  }

  async function handleSetPrimary(imageId: string) {
    if (!imageProduct) return
    setSettingPrimaryId(imageId)
    try {
      await setProductImagePrimary(imageProduct.id, imageId)
      setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imageId })))
    } catch {
      // silently fail
    } finally {
      setSettingPrimaryId(null)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">محصولات</h1>
          <p className="text-muted-foreground text-sm mt-1">مدیریت محصولات فروشگاه</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          افزودن محصول
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      ) : pageError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-6 text-sm">
          {pageError}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground mb-4">هیچ محصولی ثبت نشده است.</p>
          <Button variant="outline" className="rounded-xl" onClick={openCreate}>
            اولین محصول را بسازید
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground w-12" />
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">نام</th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden md:table-cell">
                  دسته‌بندی
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">قیمت (تومان)</th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden sm:table-cell">
                  موجودی
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">وضعیت</th>
                <th className="px-6 py-3.5 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(product => {
                const primaryImage = product.images?.find(img => img.isPrimary) ?? product.images?.[0]
                return (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      {primaryImage ? (
                        <img
                          src={getMediaUrl(primaryImage.imageUrl)}
                          alt={primaryImage.altText ?? product.name}
                          className="w-9 h-9 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {product.category ? (
                        <span className="text-muted-foreground">{product.category.name}</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground tabular-nums">
                          {fmtPrice(product.price)}
                        </p>
                        {product.discountedPrice != null && (
                          <p className="text-xs text-primary mt-0.5 tabular-nums">
                            {fmtPrice(product.discountedPrice)} تخفیف
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell tabular-nums text-muted-foreground">
                      {product.stockQuantity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {product.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full w-fit">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full w-fit">
                            غیرفعال
                          </span>
                        )}
                        {product.featuredOnHomepage && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full w-fit">
                            <BookmarkCheck className="w-3 h-3" />
                            ویژه
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleToggleFeatured(product.id)}
                          disabled={featuredId === product.id}
                          className={`rounded-lg ${product.featuredOnHomepage ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-50'}`}
                          title={product.featuredOnHomepage ? 'حذف از ویژه' : 'افزودن به ویژه'}
                        >
                          {featuredId === product.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : product.featuredOnHomepage ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openImageDialog(product)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          title="مدیریت تصاویر"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(product)}
                          className="text-muted-foreground hover:text-foreground rounded-lg"
                          title="ویرایش"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        {product.isActive ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeactivate(product.id)}
                            disabled={actionId === product.id}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="غیرفعال کردن"
                          >
                            {actionId === product.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <PowerOff className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleActivate(product.id)}
                            disabled={actionId === product.id}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                            title="فعال کردن"
                          >
                            {actionId === product.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editTarget ? 'ویرایش محصول' : 'افزودن محصول'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-1">
            {/* Row 1: Name + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-name">نام محصول *</Label>
                <Input
                  id="p-name"
                  placeholder="نام محصول"
                  value={form.name}
                  onChange={field('name')}
                  disabled={submitting}
                  className="h-10"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-slug">
                  اسلاگ *
                  <span className="text-muted-foreground text-xs font-normal mr-1">(لاتین)</span>
                </Label>
                <Input
                  id="p-slug"
                  placeholder="product-slug"
                  value={form.slug}
                  onChange={field('slug')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 font-mono text-sm"
                />
              </div>
            </div>

            {/* Row 2: Price + Discounted Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price">قیمت (تومان) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  placeholder="0"
                  min={0}
                  step="any"
                  value={form.price}
                  onChange={field('price')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-disc">
                  قیمت با تخفیف (تومان)
                  <span className="text-muted-foreground text-xs font-normal mr-1">(اختیاری)</span>
                </Label>
                <Input
                  id="p-disc"
                  type="number"
                  placeholder="0"
                  min={0}
                  step="any"
                  value={form.discountedPrice}
                  onChange={field('discountedPrice')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 tabular-nums"
                />
              </div>
            </div>

            {/* Row 3: Category + Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-cat">دسته‌بندی</Label>
                <select
                  id="p-cat"
                  value={form.categoryId}
                  onChange={field('categoryId')}
                  disabled={submitting}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus:outline-none focus:ring-[3px] focus:ring-ring/50 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-brand">برند</Label>
                <Input
                  id="p-brand"
                  placeholder="نام برند"
                  value={form.brand}
                  onChange={field('brand')}
                  disabled={submitting}
                  className="h-10"
                />
              </div>
            </div>

            {/* Row 4: SKU + Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-sku">کد محصول (SKU)</Label>
                <Input
                  id="p-sku"
                  placeholder="SKU-001"
                  value={form.sku}
                  onChange={field('sku')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock">موجودی انبار</Label>
                <Input
                  id="p-stock"
                  type="number"
                  placeholder="0"
                  min={0}
                  step={1}
                  value={form.stockQuantity}
                  onChange={field('stockQuantity')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 tabular-nums"
                />
              </div>
            </div>

            {/* Row 5: Description */}
            <div className="space-y-2">
              <Label htmlFor="p-desc">توضیحات</Label>
              <Textarea
                id="p-desc"
                placeholder="توضیحات محصول (اختیاری)"
                value={form.description}
                onChange={field('description')}
                disabled={submitting}
                rows={3}
              />
            </div>

            {formError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {formError}
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="rounded-xl"
              >
                انصراف
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    در حال ذخیره...
                  </span>
                ) : editTarget ? (
                  'ذخیره تغییرات'
                ) : (
                  'افزودن محصول'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Image management dialog ───────────────────────────────────────── */}
      <Dialog open={!!imageProduct} onOpenChange={open => !open && setImageProduct(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              تصاویر محصول: {imageProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {imageDialogLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-3">
              <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
              <span className="text-sm">در حال بارگذاری...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              {/* Upload button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      در حال آپلود...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      افزودن تصویر
                    </>
                  )}
                </Button>
                {uploadError && (
                  <p className="text-destructive text-xs mt-1.5">{uploadError}</p>
                )}
              </div>

              {/* Image grid */}
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  هیچ تصویری آپلود نشده است.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {images.map(img => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border aspect-square">
                      <img
                        src={getMediaUrl(img.imageUrl)}
                        alt={img.altText ?? ''}
                        className="w-full h-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          اصلی
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {!img.isPrimary && (
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            onClick={() => handleSetPrimary(img.id)}
                            disabled={settingPrimaryId === img.id}
                            className="h-7 w-7 rounded-lg"
                            title="تصویر اصلی"
                          >
                            {settingPrimaryId === img.id ? (
                              <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <Star className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(img.id)}
                          disabled={deletingImageId === img.id}
                          className="h-7 w-7 rounded-lg"
                          title="حذف"
                        >
                          {deletingImageId === img.id ? (
                            <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 mt-2 border-t border-border">
            <Button variant="outline" onClick={() => setImageProduct(null)} className="rounded-xl">
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
