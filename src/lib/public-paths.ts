const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/magic-link',
  '/pricing',
  '/about',
  '/privacy',
  '/terms',
  '/api/billing/webhook',
  '/api/request',
  // Signup confirmation, magic links, and password reset land here with a
  // one-time code and no session. Middleware must let this route run or the
  // code is dropped on the redirect to /login.
  '/api/auth/callback',
]

/** Routes that must be reachable without a Supabase session. */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Keep post-auth redirects on this origin. Rejects absolute URLs,
 * protocol-relative URLs, and backslash variants browsers treat as
 * a different host.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('://')) {
    return fallback
  }

  try {
    const decoded = decodeURIComponent(value)
    if (decoded.startsWith('//') || decoded.includes('\\') || decoded.includes('://')) return fallback

    const base = 'https://app.local'
    const url = new URL(value, base)
    if (url.origin !== base) return fallback
    if (!url.pathname.startsWith('/') || url.pathname.startsWith('//') || url.pathname.includes('\\')) {
      return fallback
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
