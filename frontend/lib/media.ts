const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

/**
 * Converts a stored imageUrl to a browser-loadable URL.
 * - Absolute URLs (http/https) are returned as-is.
 * - Relative paths (starting with /) are prefixed with the API base URL.
 */
export function getMediaUrl(imageUrl: string): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}
