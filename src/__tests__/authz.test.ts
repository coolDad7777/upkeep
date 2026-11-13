import {
  isCronRequestAuthorized,
  isPlatformAdmin,
  isPublicPath,
  safeRedirectPath,
} from '@/lib/authz'

describe('public paths', () => {
  it('lets the reminder cron and health check through without a session', () => {
    expect(isPublicPath('/api/reminders/send')).toBe(true)
    expect(isPublicPath('/api/health')).toBe(true)
    expect(isPublicPath('/api/billing/webhook')).toBe(true)
  })

  it('still requires a session for the app and for near-miss paths', () => {
    expect(isPublicPath('/dashboard')).toBe(false)
    expect(isPublicPath('/api/admin/suspend')).toBe(false)
    expect(isPublicPath('/api/reminders/send-now')).toBe(false)
    expect(isPublicPath('/api/reminders/sendExtra')).toBe(false)
  })
})

describe('platform admin allow-list', () => {
  it('does not treat every user as admin when ADMIN_EMAILS is unset', () => {
    expect(isPlatformAdmin(undefined, 'anyone@example.com')).toBe(false)
    expect(isPlatformAdmin('', 'anyone@example.com')).toBe(false)
    expect(isPlatformAdmin('  ,  ', 'anyone@example.com')).toBe(false)
  })

  it('allows only listed emails', () => {
    expect(isPlatformAdmin('owner@example.com, ops@example.com', 'ops@example.com')).toBe(true)
    expect(isPlatformAdmin('owner@example.com', 'someone@example.com')).toBe(false)
    expect(isPlatformAdmin('owner@example.com', null)).toBe(false)
  })
})

describe('cron authorization', () => {
  it('fails closed when the secret is missing', () => {
    expect(isCronRequestAuthorized(undefined, 'Bearer anything')).toBe(false)
    expect(isCronRequestAuthorized('', 'Bearer secret')).toBe(false)
  })

  it('accepts only the exact bearer token', () => {
    expect(isCronRequestAuthorized('cron-secret', 'Bearer cron-secret')).toBe(true)
    expect(isCronRequestAuthorized('cron-secret', 'Bearer other')).toBe(false)
    expect(isCronRequestAuthorized('cron-secret', null)).toBe(false)
  })
})

describe('safe redirect paths', () => {
  it('keeps same-origin paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard')
    expect(safeRedirectPath('/people/123?tab=docs')).toBe('/people/123?tab=docs')
    expect(safeRedirectPath(null)).toBe('/dashboard')
  })

  it('rejects redirects that leave the origin', () => {
    expect(safeRedirectPath('//evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('https://evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('/\\evil.example')).toBe('/dashboard')
    expect(safeRedirectPath('@evil.example')).toBe('/dashboard')
    expect(safeRedirectPath('\\\\/evil.example')).toBe('/dashboard')
  })
})
