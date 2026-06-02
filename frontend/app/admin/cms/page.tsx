'use client'

import { useEffect, useState } from 'react'
import { Globe, Loader2, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getHomepageSettings, updateHomepageSettings } from '@/lib/api'
import type { HomepageSettings } from '@/types/cms'

// ─── Toggle helper ────────────────────────────────────────────────────────────

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${value ? 'text-primary' : 'text-muted-foreground'}`}
    >
      {value ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
      {label}
    </button>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-foreground text-base">{title}</h2>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CmsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getHomepageSettings()
      .then(setSettings)
      .catch(() => toast.error('خطا در دریافت تنظیمات'))
      .finally(() => setLoading(false))
  }, [])

  function update<K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev)
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await updateHomepageSettings({
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroButtonText: settings.heroButtonText,
        heroButtonLink: settings.heroButtonLink,
        promoBannerTitle: settings.promoBannerTitle,
        promoBannerSubtitle: settings.promoBannerSubtitle,
        aboutTitle: settings.aboutTitle,
        aboutDescription: settings.aboutDescription,
        contactPhone: settings.contactPhone,
        contactWhatsapp: settings.contactWhatsapp,
        isHeroEnabled: settings.isHeroEnabled,
        isPromoEnabled: settings.isPromoEnabled,
        isFeaturedProductsEnabled: settings.isFeaturedProductsEnabled,
        isFeaturedCategoriesEnabled: settings.isFeaturedCategoriesEnabled,
        isAboutEnabled: settings.isAboutEnabled,
      })
      setSettings(updated)
      toast.success('تنظیمات با موفقیت ذخیره شد')
    } catch {
      toast.error('خطا در ذخیره تنظیمات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminShell>
    )
  }

  if (!settings) return null

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">مدیریت محتوای صفحه اصلی</h1>
              <p className="text-muted-foreground text-sm">تنظیمات بخش‌های نمایش داده‌شده به مشتریان</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            ذخیره تنظیمات
          </Button>
        </div>

        {/* Hero Section */}
        <Section title="بخش هیرو (Banner اصلی)">
          <Toggle
            value={settings.isHeroEnabled}
            onChange={v => update('isHeroEnabled', v)}
            label={settings.isHeroEnabled ? 'فعال' : 'غیرفعال'}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>عنوان اصلی</Label>
              <Input value={settings.heroTitle} onChange={e => update('heroTitle', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>متن دکمه</Label>
              <Input value={settings.heroButtonText} onChange={e => update('heroButtonText', e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>زیرعنوان</Label>
              <Textarea value={settings.heroSubtitle} onChange={e => update('heroSubtitle', e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>لینک دکمه</Label>
              <Input value={settings.heroButtonLink} onChange={e => update('heroButtonLink', e.target.value)} dir="ltr" />
            </div>
          </div>
        </Section>

        {/* Promo Banner */}
        <Section title="بنر تبلیغاتی">
          <Toggle
            value={settings.isPromoEnabled}
            onChange={v => update('isPromoEnabled', v)}
            label={settings.isPromoEnabled ? 'فعال' : 'غیرفعال'}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>عنوان بنر</Label>
              <Input value={settings.promoBannerTitle} onChange={e => update('promoBannerTitle', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>زیرعنوان بنر</Label>
              <Input value={settings.promoBannerSubtitle} onChange={e => update('promoBannerSubtitle', e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Featured Sections */}
        <Section title="بخش‌های ویژه">
          <div className="space-y-3">
            <Toggle
              value={settings.isFeaturedProductsEnabled}
              onChange={v => update('isFeaturedProductsEnabled', v)}
              label="محصولات ویژه"
            />
            <Toggle
              value={settings.isFeaturedCategoriesEnabled}
              onChange={v => update('isFeaturedCategoriesEnabled', v)}
              label="دسته‌بندی‌های ویژه"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            برای انتخاب محصولات و دسته‌بندی‌های ویژه به صفحه محصولات و دسته‌بندی‌ها مراجعه کنید.
          </p>
        </Section>

        {/* About */}
        <Section title="درباره ما">
          <Toggle
            value={settings.isAboutEnabled}
            onChange={v => update('isAboutEnabled', v)}
            label={settings.isAboutEnabled ? 'فعال' : 'غیرفعال'}
          />
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>عنوان</Label>
              <Input value={settings.aboutTitle} onChange={e => update('aboutTitle', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>توضیحات</Label>
              <Textarea value={settings.aboutDescription} onChange={e => update('aboutDescription', e.target.value)} rows={3} />
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="اطلاعات تماس">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>شماره تماس</Label>
              <Input value={settings.contactPhone} onChange={e => update('contactPhone', e.target.value)} dir="ltr" placeholder="021xxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label>شماره واتساپ</Label>
              <Input value={settings.contactWhatsapp} onChange={e => update('contactWhatsapp', e.target.value)} dir="ltr" placeholder="09xxxxxxxxx" />
            </div>
          </div>
        </Section>

        {/* Save bottom */}
        <div className="flex justify-end pb-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            ذخیره تنظیمات
          </Button>
        </div>
      </div>
    </AdminShell>
  )
}
