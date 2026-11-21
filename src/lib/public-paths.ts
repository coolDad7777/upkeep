export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/magic-link',
  '/pricing',
  '/about',
  '/privacy',
  '/terms',
  '/request',
  '/api/billing/webhook',
  '/api/request',
]

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
