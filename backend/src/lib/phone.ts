// Accepts: 09xxxxxxxxx | +989xxxxxxxxx | 00989xxxxxxxxx
// Returns: +989xxxxxxxxx (E.164 without hyphens/spaces)
const IRANIAN_MOBILE_RE = /^(\+98|0098|0)9\d{9}$/

export function normalizePhone(raw: string): string {
  const s = raw.replace(/[\s\-().]+/g, '')
  if (!IRANIAN_MOBILE_RE.test(s)) {
    throw new Error(`Invalid Iranian mobile number: "${raw}"`)
  }
  if (s.startsWith('+98'))  return s
  if (s.startsWith('0098')) return '+98' + s.slice(4)
  return '+98' + s.slice(1) // starts with 0
}
