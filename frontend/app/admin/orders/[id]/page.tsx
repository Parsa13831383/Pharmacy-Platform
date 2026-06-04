'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getAdminOrderById, updateAdminOrderStatus } from '@/lib/api'
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from '../page'
import type { ContactMethod, Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  ONLINE: 'پرداخت آنلاین',
  PAY_ON_DELIVERY: 'پرداخت در محل',
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'در انتظار',
  PAID: 'پرداخت شده',
  FAILED: 'ناموفق',
  CANCELLED: 'لغو شده',
}

const CONTACT_METHOD_LABEL: Record<ContactMethod, string> = {
  PHONE: 'تماس تلفنی',
  SMS: 'پیامک',
  WHATSAPP: 'واتساپ',
}

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'SENT',
  'DELIVERED',
  'CANCELLED',
]

function fmtDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtPrice(amount: string) {
  return Number(amount).toLocaleString('fa-IR')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3.5 gap-4">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="font-medium text-foreground text-sm text-left">{children}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params['id'] as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')

  useEffect(() => {
    getAdminOrderById(id)
      .then(data => {
        setOrder(data)
        setSelectedStatus(data.orderStatus)
      })
      .catch((err: Error) => setPageError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate() {
    if (!order) return
    setUpdating(true)
    setUpdateError('')
    setUpdateSuccess('')
    try {
      const updated = await updateAdminOrderStatus(order.id, selectedStatus)
      setOrder(prev => (prev ? { ...prev, orderStatus: updated.orderStatus } : prev))
      setUpdateSuccess('وضعیت سفارش با موفقیت به‌روزرسانی شد')
      setTimeout(() => setUpdateSuccess(''), 4000)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'خطایی رخ داد')
    } finally {
      setUpdating(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell>
      {/* Back button */}
      <button
        onClick={() => router.push('/admin/orders')}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به سفارش‌ها
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      ) : pageError ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-6 text-sm">
          {pageError}
        </div>
      ) : !order ? null : (
        <div className="space-y-6">
          {/* Order header */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-foreground">جزئیات سفارش</h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_CLASS[order.orderStatus]}`}
                  >
                    {ORDER_STATUS_LABEL[order.orderStatus]}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  شماره سفارش:{' '}
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded mr-1">
                    {order.orderNumber}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {fmtPrice(order.totalAmount)}
                  <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{fmtDateTime(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Two-column info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">اطلاعات مشتری</h2>
              <div className="divide-y divide-border">
                <InfoRow label="نام">{order.customerName}</InfoRow>
                <InfoRow label="تلفن">
                  <span dir="ltr">{order.customerPhone}</span>
                </InfoRow>
                <InfoRow label="روش تماس">
                  {CONTACT_METHOD_LABEL[order.contactMethod]}
                </InfoRow>
                <InfoRow label="آدرس تحویل">
                  <span className="text-right block max-w-[200px]">{order.deliveryAddress}</span>
                </InfoRow>
                {order.deliveryNotes && (
                  <InfoRow label="یادداشت تحویل">
                    <span className="text-right block max-w-[200px]">{order.deliveryNotes}</span>
                  </InfoRow>
                )}
                {order.deliveryLatitude !== null && order.deliveryLongitude !== null && (
                  <InfoRow label="موقعیت">
                    <a
                      href={`https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      باز کردن در گوگل مپ
                    </a>
                  </InfoRow>
                )}
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">اطلاعات پرداخت</h2>
              <div className="divide-y divide-border">
                <InfoRow label="روش پرداخت">
                  {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                </InfoRow>
                <InfoRow label="وضعیت پرداخت">
                  {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                </InfoRow>
                <InfoRow label="مبلغ کل">
                  <span className="tabular-nums">{fmtPrice(order.totalAmount)} تومان</span>
                </InfoRow>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">اقلام سفارش</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                      محصول
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                      قیمت واحد
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                      تعداد
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                      جمع
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map(item => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {item.productNameSnapshot}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell tabular-nums text-muted-foreground">
                        {fmtPrice(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 tabular-nums text-muted-foreground">
                        {item.quantity.toLocaleString('fa-IR')}
                      </td>
                      <td className="px-6 py-4 tabular-nums font-medium text-foreground">
                        {fmtPrice(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td
                      colSpan={3}
                      className="px-6 py-3.5 text-muted-foreground text-sm font-medium hidden sm:table-cell"
                    >
                      جمع کل
                    </td>
                    <td
                      colSpan={2}
                      className="px-6 py-3.5 text-muted-foreground text-sm font-medium table-cell sm:hidden"
                    >
                      جمع کل
                    </td>
                    <td className="px-6 py-3.5 tabular-nums font-bold text-foreground">
                      {fmtPrice(order.totalAmount)} تومان
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status update */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">به‌روزرسانی وضعیت</h2>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="space-y-2 flex-1 max-w-xs">
                <Label htmlFor="status-select">وضعیت جدید</Label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
                  disabled={updating}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus:outline-none focus:ring-[3px] focus:ring-ring/50 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ALL_ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.orderStatus}
                className="rounded-xl h-10"
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    در حال ذخیره...
                  </span>
                ) : (
                  'ذخیره تغییر'
                )}
              </Button>
            </div>

            {updateSuccess && (
              <div className="mt-4 bg-primary/10 border border-primary/20 text-primary text-sm rounded-xl px-4 py-3">
                {updateSuccess}
              </div>
            )}
            {updateError && (
              <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {updateError}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  )
}
