'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Edit2, Package, Plus, PowerOff, Sparkles, Trash2, X } from 'lucide-react'
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
  getAdminPromotions,
  getAdminPromotionById,
  createPromotion,
  updatePromotion,
  deactivatePromotion,
  addProductsToPromotion,
  removeProductFromPromotion,
  getAdminProducts,
} from '@/lib/api'
import type { Promotion, PromotionProductItem } from '@/types/promotion'
import type { Product } from '@/types/product'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Convert ISO string to datetime-local input value
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16) // "YYYY-MM-DDTHH:MM"
}

// Convert datetime-local input value to ISO string
function fromLocalInput(val: string): string | undefined {
  if (!val) return undefined
  return new Date(val).toISOString()
}

function validateSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug)
}

// ─── Form types ───────────────────────────────────────────────────────────────

interface PromotionForm {
  title: string
  slug: string
  description: string
  bannerText: string
  startsAt: string
  endsAt: string
}

const EMPTY_FORM: PromotionForm = {
  title: '',
  slug: '',
  description: '',
  bannerText: '',
  startsAt: '',
  endsAt: '',
}

function promoToForm(p: Promotion): PromotionForm {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description ?? '',
    bannerText: p.bannerText ?? '',
    startsAt: toLocalInput(p.startsAt),
    endsAt: toLocalInput(p.endsAt),
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Promotion | null>(null)
  const [form, setForm] = useState<PromotionForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Deactivate action
  const [actionId, setActionId] = useState<string | null>(null)

  // Products management dialog
  const [productsDialogPromo, setProductsDialogPromo] = useState<Promotion | null>(null)
  const [assignedProducts, setAssignedProducts] = useState<PromotionProductItem[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productDialogLoading, setProductDialogLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getAdminPromotions()
      .then(setPromotions)
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Form dialog ────────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setDialogOpen(true)
  }

  function openEdit(p: Promotion) {
    setEditTarget(p)
    setForm(promoToForm(p))
    setFormError('')
    setDialogOpen(true)
  }

  function field(key: keyof PromotionForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const title = form.title.trim()
    const slug = form.slug.trim()
    if (!title) { setFormError('عنوان الزامی است'); return }
    if (!slug) { setFormError('اسلاگ الزامی است'); return }
    if (!validateSlug(slug)) {
      setFormError('اسلاگ فقط شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد')
      return
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      setFormError('تاریخ پایان باید بعد از تاریخ شروع باشد')
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      const payload = {
        title,
        slug,
        description: form.description.trim() || undefined,
        bannerText: form.bannerText.trim() || undefined,
        startsAt: fromLocalInput(form.startsAt),
        endsAt: fromLocalInput(form.endsAt),
      }
      if (editTarget) {
        const updated = await updatePromotion(editTarget.id, payload)
        setPromotions(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createPromotion(payload)
        setPromotions(prev => [created, ...prev])
      }
      setDialogOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Deactivate ─────────────────────────────────────────────────────────────

  async function handleDeactivate(id: string) {
    setActionId(id)
    try {
      const updated = await deactivatePromotion(id)
      setPromotions(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      // silently fail
    } finally {
      setActionId(null)
    }
  }

  // ── Products management dialog ─────────────────────────────────────────────

  async function openProductsDialog(promo: Promotion) {
    setProductsDialogPromo(promo)
    setProductSearch('')
    setProductDialogLoading(true)
    try {
      const [full, products] = await Promise.all([
        getAdminPromotionById(promo.id),
        getAdminProducts(),
      ])
      setAssignedProducts(full.products ?? [])
      setAllProducts(products)
    } catch {
      // silently fail
    } finally {
      setProductDialogLoading(false)
    }
  }

  async function handleAddProduct(productId: string) {
    if (!productsDialogPromo) return
    setAddingIds(prev => new Set(prev).add(productId))
    try {
      const updated = await addProductsToPromotion(productsDialogPromo.id, [productId])
      setAssignedProducts(updated.products ?? [])
      setPromotions(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      // silently fail
    } finally {
      setAddingIds(prev => { const s = new Set(prev); s.delete(productId); return s })
    }
  }

  async function handleRemoveProduct(productId: string) {
    if (!productsDialogPromo) return
    setRemovingId(productId)
    try {
      const updated = await removeProductFromPromotion(productsDialogPromo.id, productId)
      setAssignedProducts(updated.products ?? [])
      setPromotions(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } catch {
      // silently fail
    } finally {
      setRemovingId(null)
    }
  }

  // Filtered available products (not yet in promotion)
  const assignedIds = new Set(assignedProducts.map(ap => ap.productId))
  const availableProducts = allProducts.filter(p => {
    if (assignedIds.has(p.id)) return false
    if (!productSearch) return true
    const q = productSearch.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand ?? '').toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q)
    )
  })

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">جشنواره‌ها</h1>
          <p className="text-muted-foreground text-sm mt-1">مدیریت تخفیف‌ها و کمپین‌های تبلیغاتی</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          افزودن جشنواره
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
      ) : promotions.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">هیچ جشنواره‌ای ثبت نشده است.</p>
          <Button variant="outline" className="rounded-xl" onClick={openCreate}>
            اولین جشنواره را بسازید
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">عنوان</th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden sm:table-cell">
                  اسلاگ
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">وضعیت</th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden md:table-cell">
                  شروع
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden md:table-cell">
                  پایان
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden lg:table-cell">
                  محصولات
                </th>
                <th className="px-6 py-3.5 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promotions.map(promo => (
                <tr key={promo.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{promo.title}</p>
                      {promo.bannerText && (
                        <p className="text-xs text-muted-foreground mt-0.5">{promo.bannerText}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {promo.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {promo.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground text-xs">
                    {fmtDate(promo.startsAt)}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground text-xs">
                    {fmtDate(promo.endsAt)}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell tabular-nums text-muted-foreground">
                    {promo._count?.products ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openProductsDialog(promo)}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        title="محصولات جشنواره"
                      >
                        <Package className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(promo)}
                        className="text-muted-foreground hover:text-foreground rounded-lg"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      {promo.isActive && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeactivate(promo.id)}
                          disabled={actionId === promo.id}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="غیرفعال‌سازی"
                        >
                          {actionId === promo.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <PowerOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editTarget ? 'ویرایش جشنواره' : 'افزودن جشنواره'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="promo-title">عنوان *</Label>
              <Input
                id="promo-title"
                placeholder="مثال: جشنواره مراقبت پوست"
                value={form.title}
                onChange={field('title')}
                disabled={submitting}
                className="h-10"
                autoFocus
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="promo-slug">
                اسلاگ *
                <span className="text-muted-foreground text-xs font-normal mr-1">(لاتین)</span>
              </Label>
              <Input
                id="promo-slug"
                placeholder="skin-care-sale"
                value={form.slug}
                onChange={field('slug')}
                disabled={submitting}
                dir="ltr"
                className="h-10 font-mono text-sm"
              />
            </div>

            {/* Banner text */}
            <div className="space-y-2">
              <Label htmlFor="promo-banner">
                متن بنر
                <span className="text-muted-foreground text-xs font-normal mr-1">(اختیاری)</span>
              </Label>
              <Input
                id="promo-banner"
                placeholder="مثال: تا ۳۰٪ تخفیف"
                value={form.bannerText}
                onChange={field('bannerText')}
                disabled={submitting}
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="promo-desc">
                توضیحات
                <span className="text-muted-foreground text-xs font-normal mr-1">(اختیاری)</span>
              </Label>
              <Textarea
                id="promo-desc"
                placeholder="توضیحات کمپین"
                value={form.description}
                onChange={field('description')}
                disabled={submitting}
                rows={2}
              />
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="promo-starts">تاریخ شروع</Label>
                <Input
                  id="promo-starts"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={field('startsAt')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-ends">تاریخ پایان</Label>
                <Input
                  id="promo-ends"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={field('endsAt')}
                  disabled={submitting}
                  dir="ltr"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            {formError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {formError}
              </div>
            )}

            <DialogFooter className="gap-2 pt-1">
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
                  'افزودن جشنواره'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Products management dialog ────────────────────────────────────── */}
      <Dialog
        open={!!productsDialogPromo}
        onOpenChange={open => !open && setProductsDialogPromo(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              محصولات جشنواره: {productsDialogPromo?.title}
            </DialogTitle>
          </DialogHeader>

          {productDialogLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-3">
              <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
              <span className="text-sm">در حال بارگذاری...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-5 min-h-0">
              {/* Assigned products */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  محصولات موجود در جشنواره ({assignedProducts.length})
                </h3>
                {assignedProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-xl">
                    هیچ محصولی اضافه نشده است.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {assignedProducts.map(ap => (
                      <div
                        key={ap.id}
                        className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {ap.product.name}
                          </p>
                          {ap.product.brand && (
                            <p className="text-xs text-muted-foreground">{ap.product.brand}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveProduct(ap.productId)}
                          disabled={removingId === ap.productId}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                          title="حذف از جشنواره"
                        >
                          {removingId === ap.productId ? (
                            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add products */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  افزودن محصول
                </h3>
                <Input
                  placeholder="جستجو در محصولات..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="h-9 mb-3 text-sm"
                />

                {availableProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {productSearch ? 'محصولی یافت نشد.' : 'همه محصولات اضافه شده‌اند.'}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {availableProducts.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between border border-border rounded-xl px-4 py-2.5 hover:bg-muted/20 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.brand && `${p.brand} · `}
                            موجودی: {p.stockQuantity}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddProduct(p.id)}
                          disabled={addingIds.has(p.id)}
                          className="rounded-lg h-7 px-2.5 gap-1 text-xs shrink-0 border-primary/30 text-primary hover:bg-primary/5"
                        >
                          {addingIds.has(p.id) ? (
                            <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <X className="w-3 h-3 rotate-45" />
                          )}
                          افزودن
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 mt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setProductsDialogPromo(null)}
              className="rounded-xl"
            >
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
