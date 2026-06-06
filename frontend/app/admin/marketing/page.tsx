'use client'

import { useEffect, useState } from 'react'
import {
  Megaphone,
  Users,
  Eye,
  Save,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAdminCampaignDrafts, createAdminCampaignDraft, getAudiencePreview } from '@/lib/api'
import type { CampaignDraft, CampaignAudience, AudiencePreview } from '@/types/marketing'
import { cn } from '@/lib/utils'

// ─── Audience config ──────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS: { value: CampaignAudience; label: string; description: string }[] = [
  { value: 'ALL', label: 'همه مشتریان', description: 'تمام مشتریان ثبت‌نام شده' },
  { value: 'VIP', label: 'مشتریان VIP', description: 'بیش از ۵ سفارش یا ۵ میلیون تومان خرید' },
  { value: 'NEW', label: 'مشتریان جدید', description: 'اولین خرید در ۳۰ روز گذشته' },
  { value: 'INACTIVE', label: 'غیرفعال', description: 'بدون سفارش در ۹۰ روز اخیر' },
  { value: 'REGULAR', label: 'معمولی', description: 'مشتریان با ۲ تا ۵ سفارش' },
  { value: 'COSMETICS', label: 'خریداران آرایشی', description: 'عمدتاً از دسته محصولات آرایشی' },
  { value: 'SKIN_CARE', label: 'مراقبت پوست', description: 'عمدتاً از دسته مراقبت پوست' },
]

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Campaign draft row ───────────────────────────────────────────────────────

function DraftRow({ draft }: { draft: CampaignDraft }) {
  const audience = AUDIENCE_OPTIONS.find(a => a.value === draft.audience)
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{draft.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{draft.message}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {audience?.label ?? draft.audience}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {fmtDate(draft.createdAt)}
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
        پیش‌نویس
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [drafts, setDrafts] = useState<CampaignDraft[]>([])
  const [draftsLoading, setDraftsLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState<CampaignAudience>('ALL')
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState('')

  // Audience preview
  const [preview, setPreview] = useState<AudiencePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    getAdminCampaignDrafts()
      .then(setDrafts)
      .catch(() => null)
      .finally(() => setDraftsLoading(false))
  }, [])

  async function handlePreview() {
    setPreviewLoading(true)
    setPreview(null)
    try {
      const res = await getAudiencePreview(audience)
      setPreview(res)
    } catch {
      // silent
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleSaveDraft() {
    setFormError('')
    if (!title.trim()) { setFormError('عنوان کمپین الزامی است'); return }
    if (!message.trim()) { setFormError('متن پیام الزامی است'); return }
    setSubmitting(true)
    try {
      const result = await createAdminCampaignDraft({ title, message, audience })
      setDrafts(prev => [result.draft, ...prev])
      setSaved(true)
      setPreview({ estimatedCount: result.estimatedCount, preview: preview?.preview ?? [] })
      setTitle('')
      setMessage('')
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'خطا در ذخیره کمپین')
    } finally {
      setSubmitting(false)
    }
  }

  // Refresh preview when audience changes
  useEffect(() => {
    setPreview(null)
  }, [audience])

  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.value === audience)!

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">بازاریابی</h1>
          <p className="text-sm text-muted-foreground mt-1">
            آماده‌سازی کمپین‌های پیامکی — ارسال واقعی پس از اتصال به Kavenegar فعال خواهد شد
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Campaign builder ── */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">کمپین جدید</h2>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">عنوان کمپین</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: جشنواره تابستانه"
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">مخاطبان</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAudience(opt.value)}
                        className={cn(
                          'text-right px-3 py-2.5 rounded-xl border text-sm transition-colors',
                          audience === opt.value
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                        )}
                      >
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground">متن پیام</label>
                    <span className="text-xs text-muted-foreground tabular-nums">{message.length} / ۱۶۰۰</span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1600}
                    placeholder="متن پیامک را اینجا بنویسید..."
                    className="w-full min-h-[120px] text-sm bg-background border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
                    dir="rtl"
                  />
                </div>

                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                    {formError}
                  </div>
                )}

                {saved && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    پیش‌نویس کمپین با موفقیت ذخیره شد
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleSaveDraft} disabled={submitting} className="gap-1.5">
                    <Save className="w-4 h-4" />
                    {submitting ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
                  </Button>
                  <Button variant="outline" onClick={handlePreview} disabled={previewLoading} className="gap-1.5">
                    <Eye className="w-4 h-4" />
                    {previewLoading ? 'در حال بارگذاری...' : 'پیش‌نمایش مخاطبان'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Message preview */}
            {message && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">پیش‌نمایش پیام</h3>
                </div>
                <div className="bg-muted rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap text-right" dir="rtl">
                  {message}
                </div>
              </div>
            )}
          </div>

          {/* ── Side panel: audience preview + drafts ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Audience stats */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">مخاطب انتخابی</h2>
              </div>

              <div className="bg-muted/40 rounded-xl p-3 mb-3">
                <p className="font-medium text-sm text-foreground">{selectedAudience.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedAudience.description}</p>
              </div>

              {preview ? (
                <div>
                  <div className="text-center py-3">
                    <p className="text-3xl font-bold tabular-nums text-foreground">{preview.estimatedCount.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-muted-foreground mt-1">گیرنده تخمینی</p>
                  </div>
                  {preview.preview.length > 0 && (
                    <div className="border border-border rounded-xl overflow-hidden mt-3">
                      <p className="text-xs text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">نمونه‌ای از گیرندگان</p>
                      {preview.preview.map((c) => (
                        <div key={c.id} className="flex items-center justify-between px-3 py-2 border-b border-border/50 last:border-0 text-xs">
                          <span className="text-foreground font-medium">{c.name}</span>
                          <span className="text-muted-foreground font-mono" dir="ltr">{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  برای مشاهده تعداد و نمونه گیرندگان، روی «پیش‌نمایش مخاطبان» کلیک کنید.
                </p>
              )}
            </div>

            {/* Saved drafts */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Save className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">پیش‌نویس‌های ذخیره‌شده</h2>
              </div>

              {draftsLoading ? (
                <div className="flex justify-center py-6">
                  <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                </div>
              ) : drafts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">هنوز کمپینی ذخیره نشده است.</p>
              ) : (
                <div>
                  {drafts.map(d => <DraftRow key={d.id} draft={d} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
