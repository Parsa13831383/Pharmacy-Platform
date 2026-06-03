// Strip trailing slash so concatenation is always clean
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/**
 * Resolves a stored imageUrl to a browser-loadable URL.
 *
 * Why rebase absolute URLs:
 *   The backend stores imageUrl as a full URL using its own BASE_URL env var
 *   (e.g. "http://localhost:3000/uploads/products/file.jpg"). If BASE_URL was
 *   unset or pointed to localhost at upload time, those URLs are broken in
 *   production. We always extract just the pathname and rebase to the
 *   frontend's configured NEXT_PUBLIC_API_URL, making the helper immune to
 *   any host mismatch between upload-time and request-time.
 *
 * Handles:
 *   - Full absolute URLs  → extract pathname, rebase to API_BASE
 *   - /relative/paths     → prepend API_BASE
 *   - bare-filenames      → treat as /uploads/... relative path
 *   - null / undefined    → return ''
 */
export function getMediaUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const { pathname } = new URL(imageUrl)
      return `${API_BASE}${pathname}`
    } catch {
      // Malformed URL — return as-is and let the browser handle it
      return imageUrl
    }
  }

  // Relative path or bare filename
  return `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}
