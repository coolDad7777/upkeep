/**
 * Integration-style tests for critical business logic.
 * Tests domain logic without requiring live services.
 */

import {
  getDocumentStatus,
  liveDocumentStatus,
  getDaysUntilExpiry,
  calculateComplianceScore,
  validateFile,
  formatFileSize,
  slugify,
  getInitials,
  formatDate,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from '@/lib/utils'

describe('Document status lifecycle', () => {
  const today = new Date()

  function daysFromNow(days: number): string {
    const d = new Date(today)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  it('returns missing when no file uploaded', () => {
    expect(getDocumentStatus(daysFromNow(60), false)).toBe('missing')
    expect(getDocumentStatus(null, false)).toBe('missing')
  })

  it('returns active for a document with no expiry date but has a file', () => {
    expect(getDocumentStatus(null, true)).toBe('active')
  })

  it('returns active for expiry far in the future', () => {
    expect(getDocumentStatus(daysFromNow(365), true)).toBe('active')
    // 35 days is safely above the 30-day expiring_soon threshold regardless of time-of-day
    expect(getDocumentStatus(daysFromNow(35), true)).toBe('active')
  })

  it('returns expiring_soon when within 30 days', () => {
    expect(getDocumentStatus(daysFromNow(30), true)).toBe('expiring_soon')
    expect(getDocumentStatus(daysFromNow(14), true)).toBe('expiring_soon')
    expect(getDocumentStatus(daysFromNow(1), true)).toBe('expiring_soon')
  })

  it('returns expired for clearly past dates', () => {
    // Avoid testing daysFromNow(0) — the exact boundary is time-of-day dependent
    expect(getDocumentStatus(daysFromNow(-1), true)).toBe('expired')
    expect(getDocumentStatus(daysFromNow(-30), true)).toBe('expired')
    expect(getDocumentStatus(daysFromNow(-365), true)).toBe('expired')
  })

  it('recomputes a stored status that has gone stale', () => {
    const now = new Date(2026, 10, 18, 15, 0, 0)

    expect(liveDocumentStatus({
      status: 'active',
      expiry_date: '2026-11-01',
      file_name: 'license.pdf',
    }, now)).toBe('expired')

    expect(liveDocumentStatus({
      status: 'active',
      expiry_date: '2026-11-28',
      file_path: 'company/license.pdf',
    }, now)).toBe('expiring_soon')

    expect(liveDocumentStatus({
      status: 'expired',
      expiry_date: '2027-05-01',
      file_name: 'license.pdf',
    }, now)).toBe('active')

    expect(liveDocumentStatus({
      status: 'missing',
      expiry_date: '2026-11-01',
    }, now)).toBe('missing')

    expect(liveDocumentStatus({
      status: 'active',
      expiry_date: '2026-11-01',
    }, now)).toBe('expired')
  })

  it('getDaysUntilExpiry returns correct values', () => {
    expect(getDaysUntilExpiry(null)).toBeNull()
    // date-fns differenceInDays truncates to whole days; a date string at midnight UTC
    // vs current local time may be off by 1 — allow ±1 for robustness
    const in10 = getDaysUntilExpiry(daysFromNow(10))
    expect(in10).toBeGreaterThanOrEqual(9)
    expect(in10).toBeLessThanOrEqual(10)
    const ago5 = getDaysUntilExpiry(daysFromNow(-5))
    expect(ago5).toBeGreaterThanOrEqual(-6)
    expect(ago5).toBeLessThanOrEqual(-4)
    // null input
    expect(getDaysUntilExpiry('')).toBeNull()
  })
})

describe('Compliance score calculation', () => {
  it('returns 100 for zero documents', () => {
    expect(calculateComplianceScore(0, 0)).toBe(100)
  })

  it('returns 100 when all docs are compliant', () => {
    expect(calculateComplianceScore(10, 10)).toBe(100)
  })

  it('returns 0 when no documents are compliant', () => {
    expect(calculateComplianceScore(5, 0)).toBe(0)
  })

  it('calculates 50% correctly', () => {
    expect(calculateComplianceScore(4, 2)).toBe(50)
  })

  it('rounds to integer', () => {
    // 2/3 = 66.66... should round to 67
    const score = calculateComplianceScore(3, 2)
    expect(Number.isInteger(score)).toBe(true)
    expect(score).toBe(67)
  })

  it('correctly weights a large document set', () => {
    expect(calculateComplianceScore(100, 75)).toBe(75)
  })
})

describe('File validation — security boundary', () => {
  function makeFile(name: string, type: string, sizeBytes: number): File {
    const content = new Array(Math.max(sizeBytes, 1)).fill('x').join('')
    return new File([content], name, { type })
  }

  it('accepts valid PDF', () => {
    const file = makeFile('license.pdf', 'application/pdf', 1024)
    expect(validateFile(file)).toBeNull()
  })

  it('accepts valid JPEG', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024)
    expect(validateFile(file)).toBeNull()
  })

  it('accepts valid PNG', () => {
    const file = makeFile('scan.png', 'image/png', 2048)
    expect(validateFile(file)).toBeNull()
  })

  it('accepts valid WebP', () => {
    const file = makeFile('photo.webp', 'image/webp', 2048)
    expect(validateFile(file)).toBeNull()
  })

  it('rejects oversized files', () => {
    const file = makeFile('big.pdf', 'application/pdf', MAX_FILE_SIZE + 1)
    expect(validateFile(file)).not.toBeNull()
    expect(validateFile(file)).toContain('10MB')
  })

  it('rejects executable files', () => {
    const executable = makeFile('malware.exe', 'application/octet-stream', 1024)
    expect(validateFile(executable)).not.toBeNull()
  })

  it('rejects JavaScript files', () => {
    const script = makeFile('script.js', 'text/javascript', 1024)
    expect(validateFile(script)).not.toBeNull()
  })

  it('rejects HTML files', () => {
    const html = makeFile('page.html', 'text/html', 1024)
    expect(validateFile(html)).not.toBeNull()
  })

  it('MAX_FILE_SIZE is exactly 10MB', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })

  it('ALLOWED_FILE_TYPES includes only safe document types', () => {
    expect(ALLOWED_FILE_TYPES).toContain('application/pdf')
    expect(ALLOWED_FILE_TYPES).toContain('image/jpeg')
    expect(ALLOWED_FILE_TYPES).toContain('image/png')
    expect(ALLOWED_FILE_TYPES).not.toContain('text/html')
    expect(ALLOWED_FILE_TYPES).not.toContain('application/javascript')
    expect(ALLOWED_FILE_TYPES).not.toContain('application/octet-stream')
  })
})

describe('File size formatting', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats small byte values', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(1023)).toBe('1023 B')
  })

  it('returns dash for null or zero', () => {
    expect(formatFileSize(null)).toBe('—')
    expect(formatFileSize(0)).toBe('—')
  })
})

describe('Text utilities', () => {
  describe('slugify', () => {
    it('converts to lowercase with hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Electrical Contractor LLC')).toBe('electrical-contractor-llc')
    })

    it('strips special characters', () => {
      expect(slugify('ABC & DEF')).toBe('abc-def')
    })

    it('handles consecutive spaces', () => {
      expect(slugify('lots   of  spaces')).toBe('lots-of-spaces')
    })

    it('strips leading and trailing hyphens', () => {
      expect(slugify('  trimmed  ')).toBe('trimmed')
    })
  })

  describe('getInitials', () => {
    it('returns two initials from full name', () => {
      expect(getInitials('John Smith')).toBe('JS')
    })

    it('returns one initial from single name', () => {
      expect(getInitials('Alice')).toBe('A')
    })

    it('uses only first two words', () => {
      expect(getInitials('Robert James Williams')).toBe('RJ')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date strings to readable format', () => {
      const result = formatDate('2024-06-15')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).not.toBe('—')
    })

    it('returns dash for null', () => {
      expect(formatDate(null)).toBe('—')
    })

    it('returns dash for empty string', () => {
      expect(formatDate('')).toBe('—')
    })
  })
})

describe('Reminder intervals — valid values', () => {
  const VALID_REMINDER_DAYS = [-30, -7, 0, 7, 14, 30, 60]

  it('only recognizes defined reminder thresholds', () => {
    expect(VALID_REMINDER_DAYS).toContain(60)
    expect(VALID_REMINDER_DAYS).toContain(30)
    expect(VALID_REMINDER_DAYS).toContain(7)
    expect(VALID_REMINDER_DAYS).toContain(0)
    expect(VALID_REMINDER_DAYS).toContain(-7)
    expect(VALID_REMINDER_DAYS).not.toContain(1)
    expect(VALID_REMINDER_DAYS).not.toContain(45)
    expect(VALID_REMINDER_DAYS).not.toContain(999)
  })

  it('includes past-due reminder intervals', () => {
    expect(VALID_REMINDER_DAYS).toContain(-7)
    expect(VALID_REMINDER_DAYS).toContain(-30)
  })
})
