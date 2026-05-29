const TOKEN_KEY = 'admin_token'

export function saveToken(token: string): void {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 7 // 7 days
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function removeToken(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
