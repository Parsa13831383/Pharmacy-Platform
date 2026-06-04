import crypto from 'crypto'
import prisma from '../lib/prisma'
import { AppError } from '../lib/errors'
import { hashPassword, comparePassword } from '../lib/bcrypt'
import { normalizePhone } from '../lib/phone'
import { sendSms } from './kavenegar.service'
import { env } from '../config/env'

// ─── Tunables ─────────────────────────────────────────────────────────────────
const OTP_TTL_MS          = 5  * 60 * 1_000   // 5 minutes
const RATE_WINDOW_MS      = 15 * 60 * 1_000   // rate-limit window
const RATE_MAX            = 3                  // max OTPs per window per phone
const RESEND_COOLDOWN_MS  = 60 * 1_000        // min gap between consecutive sends
const MAX_ATTEMPTS        = 5                  // wrong guesses before OTP is locked

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  // crypto.randomBytes(4) → UInt32 in [0, 4 294 967 295].
  // Modulo bias < 0.001% — acceptable for a 6-digit SMS code.
  const n = crypto.randomBytes(4).readUInt32BE(0)
  return String((n % 900_000) + 100_000)
}

function buildMessage(code: string): string {
  return `داروخانه دکتر پویا نانوازاده\n\nکد تایید شما:\n${code}\n\nاعتبار: ۵ دقیقه`
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(rawPhone: string): Promise<void> {
  const phone = normalizePhone(rawPhone)

  // 1. Rate limit: max RATE_MAX requests per RATE_WINDOW_MS
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS)
  const recentCount = await prisma.phoneOtp.count({
    where: { phone, purpose: 'CHECKOUT', createdAt: { gte: windowStart } },
  })
  if (recentCount >= RATE_MAX) {
    throw new AppError(
      'تعداد درخواست‌های کد تایید بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.',
      429,
    )
  }

  // 2. Resend cooldown: must wait RESEND_COOLDOWN_MS since last request
  const last = await prisma.phoneOtp.findFirst({
    where: { phone, purpose: 'CHECKOUT' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  if (last) {
    const elapsed = Date.now() - last.createdAt.getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1_000)
      throw new AppError(`لطفاً ${wait} ثانیه صبر کنید و دوباره تلاش کنید.`, 429)
    }
  }

  // 3. Generate + hash — plain code never touches the DB
  const code = generateCode()

  if (env.SMS_MOCK_MODE) {
    console.log('\n================================')
    console.log('[OTP MOCK]')
    console.log(`Phone: ${phone}`)
    console.log(`Code: ${code}`)
    console.log('Expires: 5 minutes')
    console.log('================================\n')
  }

  const codeHash  = await hashPassword(code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  // 4. Persist
  const record = await prisma.phoneOtp.create({
    data: { phone, codeHash, purpose: 'CHECKOUT', expiresAt },
  })

  // 5. Dispatch — on failure, clean up the record so the rate limit isn't consumed
  try {
    await sendSms(phone, buildMessage(code))
  } catch (err) {
    await prisma.phoneOtp.delete({ where: { id: record.id } }).catch(() => {})
    throw new AppError('خطا در ارسال پیامک. لطفاً دوباره تلاش کنید.', 503)
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtp(rawPhone: string, inputCode: string): Promise<void> {
  const phone = normalizePhone(rawPhone)

  // Find the most recent un-used, non-expired OTP for this phone
  const otp = await prisma.phoneOtp.findFirst({
    where: {
      phone,
      purpose:  'CHECKOUT',
      isUsed:   false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    throw new AppError('کد تایید نامعتبر یا منقضی شده است.', 400)
  }

  // Atomically increment attempts only if still under the limit.
  // Using updateMany with a WHERE guard avoids a TOCTOU race.
  const bump = await prisma.phoneOtp.updateMany({
    where: { id: otp.id, attempts: { lt: MAX_ATTEMPTS } },
    data:  { attempts: { increment: 1 } },
  })

  if (bump.count === 0) {
    throw new AppError(
      'تعداد تلاش‌های مجاز تمام شده است. لطفاً کد جدیدی دریافت کنید.',
      429,
    )
  }

  const newAttempts = otp.attempts + 1
  const valid       = await comparePassword(inputCode, otp.codeHash)

  if (!valid) {
    const remaining = MAX_ATTEMPTS - newAttempts
    throw new AppError(
      remaining > 0
        ? `کد تایید اشتباه است. ${remaining} تلاش باقی‌مانده.`
        : 'کد تایید نامعتبر است. لطفاً کد جدیدی دریافت کنید.',
      400,
    )
  }

  await prisma.phoneOtp.update({
    where: { id: otp.id },
    data:  { isUsed: true },
  })
}
