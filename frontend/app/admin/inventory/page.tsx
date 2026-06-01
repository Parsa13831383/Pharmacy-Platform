'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Archive, ClipboardList, History, TriangleAlert } from 'lucide-react'
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
import { adjustInventoryStock, getInventory, getInventoryHistory } from '@/lib/api'
import type { InventoryAdjustment, InventoryItem, StockStatus } from '@/types/inventory'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<StockStatus, string> = {
  IN_STOCK: 'موجود',
  LOW_STOCK: 'کم‌موجود',
  OUT_OF_STOCK: 'ناموجود',
}

const STATUS_CLASS: Record<StockStatus, string> = {
  IN_STOCK:
    'bg-primary/10 text-primary',
  LOW_STOCK:
    'bg-amber-50 text-amber-700 border border-amber-200',
  OUT_OF_STOCK:
    'bg-destructive/10 text-destructive',
}

function fmtDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type View = 'all' | 'low'

interface AdjustForm {
  quantityDelta: string
  reason: string
}

const EMPTY_ADJUST: AdjustForm = { quantityDelta: '', reason: '' }

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [view, setView] = useState<View>('all')

  // Adjust dialog
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null)
  const [adjustForm, setAdjustForm] = useState<AdjustForm>(EMPTY_ADJUST)
  const [adjustError, setAdjustError] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustSuccess, setAdjustSuccess] = useState('')

  // History dialog
  const [historyTarget, setHistoryTarget] = useState<InventoryItem | null>(null)
  const [history, setHistory] = useState<InventoryAdjustment[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    getInventory()
      .then(setInventory)
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const total = inventory.length
  const inStock = inventory.filter(i => i.stockStatus === 'IN_STOCK').length
  const lowStock = inventory.filter(i => i.stockStatus === 'LOW_STOCK').length
  const outOfStock = inventory.filter(i => i.stockStatus === 'OUT_OF_STOCK').length

  const displayed =
    view === 'low'
      ? inventory.filter(
          i => i.stockStatus === 'LOW_STOCK' || i.stockStatus === 'OUT_OF_STOCK',
        )
      : inventory

  // ── Adjust dialog ────────────────────────────────────────────────────────────
  function openAdjust(item: InventoryItem) {
    setAdjustTarget(item)
    setAdjustForm(EMPTY_ADJUST)
    setAdjustError('')
    setAdjustSuccess('')
  }

  async function handleAdjust(e: FormEvent) {
    e.preventDefault()
    const deltaRaw = adjustForm.quantityDelta.trim()
    const reason = adjustForm.reason.trim()

    if (!deltaRaw) { setAdjustError('مقدار تغییر الزامی است'); return }
    const delta = parseInt(deltaRaw, 10)
    if (isNaN(delta)) { setAdjustError('مقدار تغییر باید عدد صحیح باشد'); return }
    if (delta === 0) { setAdjustError('مقدار تغییر نمی‌تواند صفر باشد'); return }
    if (!reason) { setAdjustError('دلیل تغییر الزامی است'); return }
    if (!adjustTarget) return

    setAdjusting(true)
    setAdjustError('')
    try {
      const result = await adjustInventoryStock({
        productId: adjustTarget.id,
        quantityDelta: delta,
        reason,
      })
      setInventory(prev =>
        prev.map(item => (item.id === result.product.id ? result.product : item)),
      )
      setAdjustSuccess('موجودی با موفقیت به‌روزرسانی شد')
      setAdjustForm(EMPTY_ADJUST)
      setTimeout(() => setAdjustSuccess(''), 3500)
    } catch (err) {
      setAdjustError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setAdjusting(false)
    }
  }

  // ── History dialog ────────────────────────────────────────────────────────────
  async function openHistory(item: InventoryItem) {
    setHistoryTarget(item)
    setHistory([])
    setHistoryError('')
    setHistoryLoading(true)
    try {
      const data = await getInventoryHistory(item.id)
      setHistory(data)
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setHistoryLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">موجودی انبار</h1>
        <p className="text-muted-foreground text-sm mt-1">کنترل و تنظیم موجودی محصولات</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      ) : pageError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-6 text-sm">
          {pageError}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'کل محصولات', value: total, icon: Archive, cls: 'text-foreground' },
              { label: 'موجود', value: inStock, icon: Archive, cls: 'text-primary' },
              {
                label: 'کم‌موجود',
                value: lowStock,
                icon: TriangleAlert,
                cls: 'text-amber-600',
              },
              {
                label: 'ناموجود',
                value: outOfStock,
                icon: Archive,
                cls: 'text-destructive',
              },
            ].map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">{label}</span>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${cls}`}>
                  {value.toLocaleString('fa-IR')}
                </p>
              </div>
            ))}
          </div>

          {/* View filter */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              همه محصولات
            </button>
            <button
              onClick={() => setView('low')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === 'low'
                  ? 'bg-amber-600 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <TriangleAlert className="w-3.5 h-3.5" />
              نیاز به توجه
              {(lowStock + outOfStock) > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {(lowStock + outOfStock).toLocaleString('fa-IR')}
                </span>
              )}
            </button>
          </div>

          {/* Inventory table */}
          {displayed.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground text-sm">
                {view === 'low'
                  ? 'همه محصولات موجودی کافی دارند.'
                  : 'هیچ محصولی ثبت نشده است.'}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">
                      نام محصول
                    </th>
                    <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden sm:table-cell">
                      کد محصول
                    </th>
                    <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">
                      موجودی
                    </th>
                    <th className="text-right px-6 py-3.5 font-medium text-muted-foreground hidden md:table-cell">
                      حد هشدار
                    </th>
                    <th className="text-right px-6 py-3.5 font-medium text-muted-foreground">
                      وضعیت
                    </th>
                    <th className="px-6 py-3.5 w-28" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayed.map(item => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{item.name}</p>
                        {!item.isActive && (
                          <p className="text-xs text-muted-foreground/60 mt-0.5">غیرفعال</p>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {item.sku ? (
                          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {item.sku}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 tabular-nums font-medium text-foreground">
                        {item.stockQuantity.toLocaleString('fa-IR')}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell tabular-nums text-muted-foreground">
                        {item.lowStockThreshold.toLocaleString('fa-IR')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CLASS[item.stockStatus]}`}
                        >
                          {STATUS_LABEL[item.stockStatus]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistory(item)}
                            className="text-muted-foreground hover:text-foreground rounded-lg h-8 px-2.5 gap-1.5"
                            title="تاریخچه"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline text-xs">تاریخچه</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAdjust(item)}
                            className="rounded-lg h-8 px-2.5 gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-xs">تنظیم</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Adjust dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!adjustTarget} onOpenChange={open => !open && setAdjustTarget(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تنظیم موجودی</DialogTitle>
          </DialogHeader>

          {adjustTarget && (
            <div className="mb-1 p-3 bg-muted/50 rounded-xl">
              <p className="font-medium text-foreground text-sm">{adjustTarget.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                موجودی فعلی:{' '}
                <span className="tabular-nums font-medium">
                  {adjustTarget.stockQuantity.toLocaleString('fa-IR')}
                </span>
              </p>
            </div>
          )}

          {adjustSuccess && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm rounded-xl px-4 py-3">
              {adjustSuccess}
            </div>
          )}

          <form onSubmit={handleAdjust} className="space-y-4 mt-1">
            <div className="space-y-2">
              <Label htmlFor="adj-delta">
                مقدار تغییر
                <span className="text-muted-foreground text-xs font-normal mr-1">
                  (مثبت برای افزودن، منفی برای کاهش)
                </span>
              </Label>
              <Input
                id="adj-delta"
                type="number"
                step={1}
                placeholder="مثال: +۵۰ یا -۵"
                value={adjustForm.quantityDelta}
                onChange={e =>
                  setAdjustForm(prev => ({ ...prev, quantityDelta: e.target.value }))
                }
                disabled={adjusting}
                dir="ltr"
                className="h-10 tabular-nums"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adj-reason">دلیل تغییر *</Label>
              <Input
                id="adj-reason"
                placeholder="مثال: ورود محموله جدید"
                value={adjustForm.reason}
                onChange={e =>
                  setAdjustForm(prev => ({ ...prev, reason: e.target.value }))
                }
                disabled={adjusting}
                className="h-10"
              />
            </div>

            {adjustError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {adjustError}
              </div>
            )}

            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustTarget(null)}
                disabled={adjusting}
                className="rounded-xl"
              >
                بستن
              </Button>
              <Button type="submit" disabled={adjusting} className="rounded-xl">
                {adjusting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    در حال ذخیره...
                  </span>
                ) : (
                  'ثبت تغییر'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── History dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!historyTarget} onOpenChange={open => !open && setHistoryTarget(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تاریخچه موجودی</DialogTitle>
          </DialogHeader>

          {historyTarget && (
            <p className="text-sm text-muted-foreground -mt-1 mb-3">{historyTarget.name}</p>
          )}

          <div className="overflow-y-auto flex-1">
            {historyLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-3">
                <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                <span className="text-sm">در حال بارگذاری...</span>
              </div>
            ) : historyError ? (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
                {historyError}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">تاریخچه‌ای ثبت نشده است.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-3.5 px-1">
                    <div className="flex-1 min-w-0 ml-4">
                      <p className="text-sm text-foreground truncate">{entry.reason}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDateTime(entry.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`tabular-nums font-semibold text-sm shrink-0 ${
                        entry.quantityDelta > 0 ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {entry.quantityDelta > 0 ? '+' : ''}
                      {entry.quantityDelta.toLocaleString('fa-IR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 mt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setHistoryTarget(null)}
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
