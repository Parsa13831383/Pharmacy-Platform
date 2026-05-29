'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Edit2, Plus, Power, PowerOff } from 'lucide-react'
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
  createCategory,
  deactivateCategory,
  getAdminCategories,
  updateCategory,
} from '@/lib/api'
import type { Category } from '@/types/category'

interface FormState {
  name: string
  slug: string
  description: string
}

const EMPTY_FORM: FormState = { name: '', slug: '', description: '' }

function validateSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug)
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    getAdminCategories()
      .then(setCategories)
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditTarget(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '' })
    setFormError('')
    setDialogOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const name = form.name.trim()
    const slug = form.slug.trim()

    if (!name) { setFormError('نام الزامی است'); return }
    if (!slug) { setFormError('اسلاگ الزامی است'); return }
    if (!validateSlug(slug)) {
      setFormError('اسلاگ فقط شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد')
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      const payload = {
        name,
        slug,
        ...(form.description.trim() && { description: form.description.trim() }),
      }
      if (editTarget) {
        const updated = await updateCategory(editTarget.id, payload)
        setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)))
      } else {
        const created = await createCategory(payload)
        setCategories(prev => [created, ...prev])
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
      const updated = await deactivateCategory(id)
      setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    } catch {
      // silently fail — middleware will catch 401 and redirect
    } finally {
      setActionId(null)
    }
  }

  async function handleActivate(id: string) {
    setActionId(id)
    try {
      const updated = await updateCategory(id, { isActive: true })
      setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    } catch {
      // silently fail
    } finally {
      setActionId(null)
    }
  }

  return (
    <AdminShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">دسته‌بندی‌ها</h1>
          <p className="text-muted-foreground text-sm mt-1">مدیریت دسته‌بندی‌های محصولات</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          افزودن دسته‌بندی
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
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground mb-4">هیچ دسته‌بندی‌ای ثبت نشده است.</p>
          <Button variant="outline" className="rounded-xl" onClick={openCreate}>
            اولین دسته‌بندی را بسازید
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">نام</th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden sm:table-cell">
                  اسلاگ
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden lg:table-cell">
                  توضیحات
                </th>
                <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">وضعیت</th>
                <th className="px-6 py-3.5 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{cat.name}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                    {cat.description ? (
                      <span className="line-clamp-1 max-w-xs">{cat.description}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {cat.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(cat)}
                        className="text-muted-foreground hover:text-foreground rounded-lg"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {cat.isActive ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeactivate(cat.id)}
                          disabled={actionId === cat.id}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="غیرفعال کردن"
                        >
                          {actionId === cat.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <PowerOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleActivate(cat.id)}
                          disabled={actionId === cat.id}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          title="فعال کردن"
                        >
                          {actionId === cat.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editTarget ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            <div className="space-y-2">
              <Label htmlFor="cat-name">نام *</Label>
              <Input
                id="cat-name"
                placeholder="مثال: مراقبت از پوست"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={submitting}
                className="h-10"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-slug">
                اسلاگ *
                <span className="text-muted-foreground text-xs font-normal mr-2">
                  (فقط حروف انگلیسی کوچک، اعداد و خط تیره)
                </span>
              </Label>
              <Input
                id="cat-slug"
                placeholder="skin-care"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                disabled={submitting}
                dir="ltr"
                className="h-10 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc">توضیحات</Label>
              <Textarea
                id="cat-desc"
                placeholder="توضیحات دسته‌بندی (اختیاری)"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
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
                  'افزودن'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
