const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const REQUEST_TOKEN_RE = /^[a-f0-9]{64}$/i

export const REQUEST_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

export const REQUEST_UPLOAD_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type RequestBlock = 'completed' | 'expired' | 'closed'

export function isRequestToken(token: string): boolean {
  return REQUEST_TOKEN_RE.test(token)
}

export function extensionForMime(mime: string): string | null {
  return REQUEST_UPLOAD_TYPES[mime] ?? null
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
}

export function dateRangeError(issueDate: string | null, expiryDate: string | null): string | null {
  if (issueDate && !isValidIsoDate(issueDate)) return 'Issue date is invalid.'
  if (expiryDate && !isValidIsoDate(expiryDate)) return 'Expiration date is invalid.'
  if (issueDate && expiryDate && issueDate > expiryDate) {
    return 'Issue date must be on or before the expiration date.'
  }
  return null
}

export function requestBlockReason(
  status: string,
  expiresAt: string,
  now = new Date(),
): RequestBlock | null {
  if (status === 'completed') return 'completed'
  if (status !== 'pending') return 'closed'
  const expiry = new Date(expiresAt)
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime()) return 'expired'
  return null
}

export function emailDisplayName(value: string): string {
  const cleaned = value.replace(/[\r\n<>"\\]/g, ' ').replace(/\s+/g, ' ').trim()
  const name = cleaned.slice(0, 80) || 'CrewCompliant'
  return `"${name}"`
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || 'document'
  const cleaned = base.replace(/[^\w.\- ()]/g, '_').slice(0, 180)
  return cleaned || 'document'
}

export function buildRequestStoragePath(input: {
  companyId: string
  personId: string | null
  vehicleId: string | null
  documentTypeId: string
  extension: string
  nowMs?: number
}): string | null {
  if (!UUID_RE.test(input.companyId) || !UUID_RE.test(input.documentTypeId)) return null
  if (!Object.values(REQUEST_UPLOAD_TYPES).includes(input.extension)) return null

  let entity: string | null = null
  if (input.personId) {
    if (!UUID_RE.test(input.personId)) return null
    entity = `person/${input.personId}`
  } else if (input.vehicleId) {
    if (!UUID_RE.test(input.vehicleId)) return null
    entity = `vehicle/${input.vehicleId}`
  }
  if (!entity) return null

  const stamp = input.nowMs ?? Date.now()
  if (!Number.isSafeInteger(stamp) || stamp < 0) return null
  return `${input.companyId}/${entity}/${input.documentTypeId}/${stamp}.${input.extension}`
}
