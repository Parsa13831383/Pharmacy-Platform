import { env } from '../config/env'

const KAVENEGAR_BASE = 'https://api.kavenegar.com/v1'

interface KavenegarResponse {
  return: { status: number; message: string }
  entries: unknown[] | null
}

export async function sendSms(receptor: string, message: string): Promise<void> {
  if (env.SMS_MOCK_MODE) {
    console.log('\n─── OTP SMS [MOCK] ──────────────────────────────────────')
    console.log(`  To:  ${receptor}`)
    console.log(`  Msg: ${message.replace(/\n/g, ' | ')}`)
    console.log('────────────────────────────────────────────────────────\n')
    return
  }

  if (!env.KAVENEGAR_API_KEY) {
    throw new Error(
      'KAVENEGAR_API_KEY is not set. Either add it to .env or set SMS_MOCK_MODE=true.',
    )
  }

  const url = `${KAVENEGAR_BASE}/${env.KAVENEGAR_API_KEY}/sms/send.json`

  const body = new URLSearchParams({
    receptor,
    message,
    sender: '',   // uses account default sender
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: controller.signal,
    })

    // HTTP-level error (e.g. 401 bad API key)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Kavenegar HTTP ${res.status}: ${text}`)
    }

    // Kavenegar returns HTTP 200 even for logical errors; check body status
    const data = (await res.json()) as KavenegarResponse
    if (data.return.status !== 200) {
      throw new Error(`Kavenegar API error ${data.return.status}: ${data.return.message}`)
    }
  } finally {
    clearTimeout(timer)
  }
}
