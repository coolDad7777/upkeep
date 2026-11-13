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
  '/api/reminders/send',
  '/api/health',
  '/api/request',
]

/** Routes that must be reachable without a Supabase session. */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Platform admins are an explicit allow-list. An unset or empty
 * ADMIN_EMAILS must not grant admin to every signed-in user.
 */
export function isPlatformAdmin(
  adminEmailsEnv: string | undefined,
  email: string | null | undefined,
): boolean {
  if (!email) return false
  const allowed = (adminEmailsEnv ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return allowed.length > 0 && allowed.includes(email)
}

/** Cron calls are bearer-authenticated. Missing CRON_SECRET fails closed. */
export function isCronRequestAuthorized(
  secret: string | undefined,
  authorizationHeader: string | null,
): boolean {
  if (!secret) return false
  return authorizationHeader === `Bearer ${secret}`
}

/**
 * Keep post-login redirects on this origin. Rejects absolute URLs,
 * protocol-relative URLs, and backslash variants that browsers treat
 * as a different host.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('://')) {
    return fallback
  }

  try {
    const base = 'https://app.local'
    const url = new URL(value, base)
    if (url.origin !== base) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
