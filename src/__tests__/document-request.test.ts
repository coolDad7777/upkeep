import { isPublicPath } from '@/lib/public-paths'
import {
  buildRequestStoragePath,
  dateRangeError,
  extensionForMime,
  emailDisplayName,
  escapeHtml,
  isRequestToken,
  requestBlockReason,
  sanitizeFileName,
} from '@/lib/document-request'

const COMPANY = '11111111-1111-4111-8111-111111111111'
const PERSON = '22222222-2222-4222-8222-222222222222'
const DOC_TYPE = '33333333-3333-4333-8333-333333333333'

describe('document request links', () => {
  it('treats the public upload page as reachable without a session', () => {
    expect(isPublicPath('/request')).toBe(true)
    expect(isPublicPath('/request/' + 'a'.repeat(64))).toBe(true)
    expect(isPublicPath('/api/request/' + 'a'.repeat(64))).toBe(true)
  })

  it('does not treat nearby routes as public', () => {
    expect(isPublicPath('/requests')).toBe(false)
    expect(isPublicPath('/dashboard')).toBe(false)
    expect(isPublicPath('/api/documents/request')).toBe(false)
  })

  it('accepts only the 32-byte hex tokens the database issues', () => {
    expect(isRequestToken('a'.repeat(64))).toBe(true)
    expect(isRequestToken('A'.repeat(64))).toBe(true)
    expect(isRequestToken('a'.repeat(63))).toBe(false)
    expect(isRequestToken('../' + 'a'.repeat(64))).toBe(false)
    expect(isRequestToken('not-a-token')).toBe(false)
  })

  it('blocks completed, expired, and unknown requests', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const past = new Date(Date.now() - 86_400_000).toISOString()
    expect(requestBlockReason('pending', future)).toBeNull()
    expect(requestBlockReason('completed', future)).toBe('completed')
    expect(requestBlockReason('pending', past)).toBe('expired')
    expect(requestBlockReason('expired', future)).toBe('closed')
    expect(requestBlockReason('pending', 'not-a-date')).toBe('expired')
  })

  it('builds a storage path only from ids and an allowlisted extension', () => {
    const path = buildRequestStoragePath({
      companyId: COMPANY,
      personId: PERSON,
      vehicleId: null,
      documentTypeId: DOC_TYPE,
      extension: 'pdf',
      nowMs: 1000,
    })
    expect(path).toBe(`${COMPANY}/person/${PERSON}/${DOC_TYPE}/1000.pdf`)
    expect(buildRequestStoragePath({
      companyId: '../etc',
      personId: PERSON,
      vehicleId: null,
      documentTypeId: DOC_TYPE,
      extension: 'pdf',
    })).toBeNull()
    expect(buildRequestStoragePath({
      companyId: COMPANY,
      personId: null,
      vehicleId: null,
      documentTypeId: DOC_TYPE,
      extension: 'pdf',
    })).toBeNull()
    expect(extensionForMime('image/jpeg')).toBe('jpg')
    expect(extensionForMime('text/html')).toBeNull()
  })

  it('rejects invalid dates and reversed ranges', () => {
    expect(dateRangeError('2026-01-01', '2026-12-31')).toBeNull()
    expect(dateRangeError('2026-13-01', null)).toBe('Issue date is invalid.')
    expect(dateRangeError('2026-02-31', null)).toBe('Issue date is invalid.')
    expect(dateRangeError('2026-06-02', '2026-06-01')).toMatch(/before the expiration/)
  })

  it('strips path segments from the stored file name', () => {
    expect(sanitizeFileName('../../license.pdf')).toBe('license.pdf')
    expect(sanitizeFileName('a/b\\c.pdf')).toBe('c.pdf')
  })

  it('keeps the email display name from breaking the From header', () => {
    expect(emailDisplayName('Johnson & Sons')).toBe('"Johnson & Sons"')
    expect(emailDisplayName('Johnson, LLC')).toBe('"Johnson, LLC"')
    expect(emailDisplayName('Evil\r\nBcc: attacker@example.com')).toBe('"Evil Bcc: attacker@example.com"')
    expect(emailDisplayName('Name <bad@example.com>')).toBe('"Name bad@example.com"')
  })

  it('escapes text that is interpolated into the request email', () => {
    expect(escapeHtml(`<a href="https://evil.test">click</a>`)).toBe(
      '&lt;a href=&quot;https://evil.test&quot;&gt;click&lt;/a&gt;',
    )
  })
})
