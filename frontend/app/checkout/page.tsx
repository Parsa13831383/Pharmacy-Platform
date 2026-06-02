'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, Leaf, Lock, Phone, ShoppingBag } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/cart-context'
import {
  createCheckoutOrder,
  sendCheckoutOtp,
  verifyCheckoutOtp,
} from '@/lib/api'
import type {
  CheckoutContactMethod,
  CheckoutPaymentMethod,
} from '@/types/checkout'

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTACT_OPTIONS: { value: CheckoutContactMethod; label: string }[] = [
  { value: 'PHONE', label: 'تماس تلفنی' },
  { value: 'SMS', label: 'پیامک' },
  { value: 'WHATSAPP', label: 'واتساپ' },
]

const PAYMENT_OPTIONS: {
  value: CheckoutPaymentMethod
  label: string
  sub?: string
  disabled?: boolean
}[] = [
  { value: 'PAY_ON_DELIVERY', label: 'پرداخت در محل' },
  { value: 'ONLINE', label: 'پرداخت آنلاین', sub: 'به‌زودی', disabled: true },
]

type Step = 1 | 2 | 3 | 4

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: 'سبد خرید' },
  { id: 2, label: 'تایید موبایل' },
  { id: 3, label: 'اطلاعات ارسال' },
  { id: 4, label: 'ثبت سفارش' },
]

const OTP_COOLDOWN = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  return n.toLocaleString('fa-IR') + ' تومان'
}

function isValidIranPhone(p: string) {
  return /^09\d{9}$/.test(p)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()

  const [step, setStep] = useState<Step>(1)

  // ── Step 2: Phone verification ────────────────────────────────────────────
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // ── Step 3: Delivery details ──────────────────────────────────────────────
  const [customerName, setCustomerName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [contactMethod, setContactMethod] =
    useState<CheckoutContactMethod>('PHONE')
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>('PAY_ON_DELIVERY')

  // ── Step 4: Submit ────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // OTP cooldown ticker
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(cooldownRef.current!)
  }, [cooldown])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSendOtp(e: { preventDefault(): void }) {
    e.preventDefault()
    setPhoneError('')
    if (!isValidIranPhone(phone)) {
      setPhoneError('شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')
      return
    }
    setSendingOtp(true)
    try {
      const res = await sendCheckoutOtp(phone)
      setOtpSent(true)
      setDevCode(res.code ?? null)
      setCooldown(OTP_COOLDOWN)
      setOtpError('')
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'خطا در ارسال کد')
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleVerifyOtp(e: { preventDefault(): void }) {
    e.preventDefault()
    if (otpCode.length !== 6) {
      setOtpError('کد تأیید باید ۶ رقم باشد')
      return
    }
    setVerifyingOtp(true)
    setOtpError('')
    try {
      await verifyCheckoutOtp(phone, otpCode)
      setPhoneVerified(true)
      setDevCode(null)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'کد اشتباه است')
    } finally {
      setVerifyingOtp(false)
    }
  }

  async function handleSubmit() {
    if (items.length === 0) { setSubmitError('سبد خرید خالی است'); return }
    if (!phoneVerified) { setSubmitError('شماره موبایل تأیید نشده است'); return }
    if (!customerName.trim()) { setSubmitError('نام و نام خانوادگی الزامی است'); return }
    if (!deliveryAddress.trim()) { setSubmitError('آدرس تحویل الزامی است'); return }

    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await createCheckoutOrder({
        customerName: customerName.trim(),
        customerPhone: phone,
        deliveryAddress: deliveryAddress.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        contactMethod,
        paymentMethod,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      })
      clearCart()
      router.push(`/order-success?orderNumber=${encodeURIComponent(result.order.orderNumber)}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'خطایی رخ داد. دوباره تلاش کنید.')
    } finally {
      setSubmitting(false)
    }
  }

  const shipping = totalAmount >= 500_000 ? 0 : 50_000
  const finalTotal = totalAmount + shipping

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 bg-slate-50">
        {/* Breadcrumb */}
        <div className="border-b border-slate-100 bg-white">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">خانه</Link>
              <ArrowRight className="w-3 h-3" />
              <Link href="/cart" className="hover:text-foreground transition-colors">سبد خرید</Link>
              <ArrowRight className="w-3 h-3" />
              <span className="text-foreground">تسویه حساب</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Step indicator */}
          <div className="flex items-center mb-8 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step > s.id
                        ? 'bg-primary text-primary-foreground'
                        : step === s.id
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:inline transition-colors ${
                      step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-px mx-2 transition-colors ${
                      step > s.id ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Main form column ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* ══ STEP 1: Cart review ══════════════════════════════════════ */}
              {step === 1 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    بررسی سبد خرید
                  </h2>

                  {items.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">سبد خرید شما خالی است.</p>
                      <Link href="/products">
                        <Button variant="outline" className="rounded-xl">مشاهده محصولات</Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-border">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-4 py-3.5">
                            <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                              <Leaf className="w-4 h-4 text-primary/40" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {item.name}
                              </p>
                              {item.brand && (
                                <p className="text-xs text-muted-foreground">{item.brand}</p>
                              )}
                            </div>
                            <div className="text-left shrink-0 space-y-0.5">
                              <p className="text-xs text-muted-foreground">
                                {item.quantity.toLocaleString('fa-IR')} عدد
                              </p>
                              <p className="font-medium text-foreground text-sm tabular-nums">
                                {fmtPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>جمع سبد</span>
                          <span className="tabular-nums">{fmtPrice(totalAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>هزینه ارسال</span>
                          <span className={shipping === 0 ? 'text-primary font-medium' : 'tabular-nums'}>
                            {shipping === 0 ? 'رایگان' : fmtPrice(shipping)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-foreground pt-1 border-t border-border">
                          <span>جمع کل</span>
                          <span className="tabular-nums">{fmtPrice(finalTotal)}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={() => setStep(2)}
                          className="rounded-xl px-8 gap-2"
                        >
                          تأیید و ادامه
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ══ STEP 2: Phone verification ═══════════════════════════════ */}
              {step === 2 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    تأیید شماره موبایل
                  </h2>

                  {phoneVerified ? (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                      <CheckCircle className="w-14 h-14 text-primary" />
                      <div>
                        <p className="font-bold text-foreground text-lg">شماره تأیید شد</p>
                        <p className="text-muted-foreground text-sm mt-1" dir="ltr">
                          {phone}
                        </p>
                      </div>
                      <Button
                        onClick={() => setStep(3)}
                        className="rounded-xl px-8 gap-2 mt-2"
                      >
                        ادامه به اطلاعات ارسال
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5 max-w-sm">
                      {/* Phone input */}
                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="phone">شماره موبایل *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            value={phone}
                            onChange={e => {
                              setPhone(e.target.value)
                              setPhoneError('')
                            }}
                            disabled={sendingOtp || (otpSent && cooldown > 0)}
                            dir="ltr"
                            className="h-11 text-base tracking-wider"
                            autoFocus
                          />
                          {phoneError && (
                            <p className="text-destructive text-sm">{phoneError}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={sendingOtp || (otpSent && cooldown > 0)}
                          variant={otpSent ? 'outline' : 'default'}
                          className="w-full rounded-xl h-11"
                        >
                          {sendingOtp ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              در حال ارسال...
                            </span>
                          ) : otpSent && cooldown > 0 ? (
                            `ارسال مجدد (${cooldown.toLocaleString('fa-IR')} ثانیه)`
                          ) : (
                            'ارسال کد تأیید'
                          )}
                        </Button>
                      </form>

                      {/* Dev code hint */}
                      {devCode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <p className="text-amber-800 text-xs font-medium mb-0.5">کد تست (محیط توسعه)</p>
                          <p className="text-amber-900 font-mono font-bold text-xl tracking-[0.3em]">
                            {devCode}
                          </p>
                        </div>
                      )}

                      {/* OTP input */}
                      {otpSent && (
                        <form onSubmit={handleVerifyOtp} className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="otp">کد تأیید *</Label>
                            <Input
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="۶ رقم"
                              value={otpCode}
                              onChange={e => {
                                setOtpCode(e.target.value.replace(/\D/g, ''))
                                setOtpError('')
                              }}
                              disabled={verifyingOtp}
                              dir="ltr"
                              className="h-11 text-xl text-center tracking-[0.4em] font-mono"
                              autoFocus
                            />
                            {otpError && (
                              <p className="text-destructive text-sm">{otpError}</p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            disabled={verifyingOtp || otpCode.length !== 6}
                            className="w-full rounded-xl h-11"
                          >
                            {verifyingOtp ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                در حال تأیید...
                              </span>
                            ) : (
                              'تأیید کد'
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ══ STEP 3: Delivery details ══════════════════════════════════ */}
              {step === 3 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-bold text-lg text-foreground mb-5">
                    اطلاعات ارسال
                  </h2>

                  <div className="space-y-5 max-w-lg">
                    {/* Verified phone badge */}
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary/8 rounded-xl px-3 py-2 w-fit">
                      <Lock className="w-3.5 h-3.5" />
                      <span>موبایل تأیید شده:</span>
                      <span dir="ltr" className="font-mono font-medium">{phone}</span>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="cname">نام و نام خانوادگی *</Label>
                      <Input
                        id="cname"
                        placeholder="نام کامل گیرنده"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="h-11"
                        autoFocus
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="addr">آدرس کامل *</Label>
                      <Textarea
                        id="addr"
                        placeholder="استان، شهر، خیابان، پلاک، کد پستی"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">
                        توضیحات ارسال
                        <span className="text-muted-foreground text-xs font-normal mr-1">(اختیاری)</span>
                      </Label>
                      <Input
                        id="notes"
                        placeholder="مثال: زنگ در نزنید، درب را بگذارید"
                        value={deliveryNotes}
                        onChange={e => setDeliveryNotes(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    {/* Contact method */}
                    <div className="space-y-3">
                      <Label>روش ارتباط *</Label>
                      <div className="flex flex-wrap gap-2">
                        {CONTACT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setContactMethod(opt.value)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                              contactMethod === opt.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-3">
                      <Label>روش پرداخت *</Label>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={opt.disabled}
                            onClick={() => !opt.disabled && setPaymentMethod(opt.value)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                              opt.disabled
                                ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border'
                                : paymentMethod === opt.value
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                            }`}
                          >
                            {opt.label}
                            {opt.sub && (
                              <span className="mr-1 text-xs opacity-70">({opt.sub})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        onClick={() => {
                          if (!customerName.trim()) return
                          if (!deliveryAddress.trim()) return
                          setStep(4)
                        }}
                        disabled={!customerName.trim() || !deliveryAddress.trim()}
                        className="rounded-xl px-8 gap-2"
                      >
                        بررسی و ثبت سفارش
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 4: Review & submit ═══════════════════════════════════ */}
              {step === 4 && (
                <div className="space-y-4">
                  {/* Info summary */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-bold text-lg text-foreground mb-4">بررسی اطلاعات</h2>

                    <div className="divide-y divide-border text-sm">
                      <Row label="شماره موبایل">
                        <span dir="ltr" className="font-mono">{phone}</span>
                        <span className="mr-2 text-xs text-primary">✓ تأیید شده</span>
                      </Row>
                      <Row label="نام گیرنده">{customerName}</Row>
                      <Row label="آدرس">{deliveryAddress}</Row>
                      {deliveryNotes && <Row label="توضیحات">{deliveryNotes}</Row>}
                      <Row label="روش ارتباط">
                        {CONTACT_OPTIONS.find(c => c.value === contactMethod)?.label}
                      </Row>
                      <Row label="روش پرداخت">
                        {PAYMENT_OPTIONS.find(p => p.value === paymentMethod)?.label}
                      </Row>
                    </div>

                    <button
                      onClick={() => setStep(3)}
                      className="mt-4 text-xs text-primary hover:underline"
                    >
                      ویرایش اطلاعات
                    </button>
                  </div>

                  {/* Cart items summary */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-bold text-foreground mb-4 text-sm">اقلام سفارش</h2>
                    <div className="divide-y divide-border">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-muted-foreground shrink-0">
                              ×{item.quantity.toLocaleString('fa-IR')}
                            </span>
                            <span className="text-foreground truncate">{item.name}</span>
                          </div>
                          <span className="tabular-nums font-medium text-foreground shrink-0 mr-4">
                            {fmtPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-3 mt-2 flex items-center justify-between font-bold text-foreground">
                      <span>جمع کل پرداختی</span>
                      <span className="tabular-nums">{fmtPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Error */}
                  {submitError && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl px-5 py-4 text-sm">
                      {submitError}
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || items.length === 0}
                    size="lg"
                    className="w-full rounded-xl h-14 text-base"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-3">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        در حال ثبت سفارش...
                      </span>
                    ) : (
                      'ثبت نهایی سفارش'
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* ── Order summary sidebar ─────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
                <h3 className="font-bold text-foreground mb-4 text-sm">خلاصه سفارش</h3>

                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    سبد خالی است
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      {items.map(item => (
                        <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                          <p className="text-muted-foreground line-clamp-2 flex-1">
                            <span className="text-foreground font-medium ml-1">
                              ×{item.quantity.toLocaleString('fa-IR')}
                            </span>
                            {item.name}
                          </p>
                          <span className="tabular-nums shrink-0 text-foreground">
                            {fmtPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>جمع</span>
                        <span className="tabular-nums">{fmtPrice(totalAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>ارسال</span>
                        <span className={shipping === 0 ? 'text-primary font-medium' : 'tabular-nums'}>
                          {shipping === 0 ? 'رایگان' : fmtPrice(shipping)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-foreground border-t border-border pt-2">
                        <span>کل</span>
                        <span className="tabular-nums">{fmtPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Step navigation hint */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    {step === 1 && 'سبد خرید را بررسی کنید'}
                    {step === 2 && 'شماره موبایل خود را تأیید کنید'}
                    {step === 3 && 'اطلاعات ارسال را وارد کنید'}
                    {step === 4 && 'اطلاعات را بررسی و ثبت کنید'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ─── Helper sub-component ─────────────────────────────────────────────────────

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between py-3 gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right">{children}</span>
    </div>
  )
}
