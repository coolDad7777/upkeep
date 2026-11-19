import { readFileSync } from 'node:fs'
import path from 'node:path'
import { isPublicPath, safeRedirectPath } from '@/lib/public-paths'

describe('auth callback is reachable before a session exists', () => {
  it('lets the code exchange run without a session', () => {
    expect(isPublicPath('/api/auth/callback')).toBe(true)
    expect(isPublicPath('/api/auth/callback/')).toBe(true)
  })

  it('does not treat nearby auth routes as public', () => {
    expect(isPublicPath('/api/auth/callbackExtra')).toBe(false)
    expect(isPublicPath('/api/auth/callback-now')).toBe(false)
    expect(isPublicPath('/update-password')).toBe(false)
    expect(isPublicPath('/api/admin/suspend')).toBe(false)
    expect(isPublicPath('/onboarding')).toBe(false)
  })

  it('still allows the webhook and marketing pages', () => {
    expect(isPublicPath('/api/billing/webhook')).toBe(true)
    expect(isPublicPath('/login')).toBe(true)
    expect(isPublicPath('/signup')).toBe(true)
    expect(isPublicPath('/')).toBe(true)
  })
})

describe('safeRedirectPath', () => {
  it('keeps same-origin paths used by signup and password reset', () => {
    expect(safeRedirectPath('/onboarding')).toBe('/onboarding')
    expect(safeRedirectPath('/update-password')).toBe('/update-password')
    expect(safeRedirectPath('/people/123?tab=docs')).toBe('/people/123?tab=docs')
    expect(safeRedirectPath(null)).toBe('/dashboard')
  })

  it('rejects redirects that leave the origin', () => {
    expect(safeRedirectPath('//evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('https://evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('/\\evil.example')).toBe('/dashboard')
    expect(safeRedirectPath('/%5Cevil.example')).toBe('/dashboard')
    expect(safeRedirectPath('/%2f%2fevil.example')).toBe('/dashboard')
    expect(safeRedirectPath('@evil.example')).toBe('/dashboard')
    expect(safeRedirectPath('\\\\/evil.example')).toBe('/dashboard')
  })
})

describe('owner can bootstrap a company under RLS', () => {
  const sql = readFileSync(
    path.join(process.cwd(), 'supabase/migrations/003_owner_bootstrap.sql'),
    'utf8',
  )

  it('lets the owner read the company row their insert returns', () => {
    expect(sql).toMatch(/CREATE POLICY "company_select_owner" ON public\.companies/)
    expect(sql).toMatch(/FOR SELECT/)
    expect(sql).toMatch(/owner_id = auth\.uid\(\)/)
  })

  it('lets the owner insert only their own owner membership', () => {
    expect(sql).toMatch(/CREATE POLICY "members_insert_owner" ON public\.company_members/)
    expect(sql).toMatch(/user_id = auth\.uid\(\)/)
    expect(sql).toMatch(/role = 'owner'/)
    expect(sql).toMatch(/owned\.owner_id = auth\.uid\(\)/)
    expect(sql).not.toMatch(/role = 'admin'/)
    expect(sql).not.toMatch(/role = 'staff'/)
  })
})
