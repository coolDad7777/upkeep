import {
  getDocumentStatus,
  getDaysUntilExpiry,
  formatDate,
  formatFileSize,
  getStatusColor,
  getStatusLabel,
  validateFile,
  calculateComplianceScore,
  slugify,
  getInitials,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from '@/lib/utils'

describe('getDocumentStatus', () => {
  it('returns missing when no file', () => {
    expect(getDocumentStatus(null, false)).toBe('missing')
    expect(getDocumentStatus('2030-01-01', false)).toBe('missing')
  })

  it('returns active when no expiry date', () => {
    expect(getDocumentStatus(null, true)).toBe('active')
  })

  it('returns expired for past dates', () => {
    expect(getDocumentStatus('2020-01-01', true)).toBe('expired')
  })

  it('returns expiring_soon for dates within 30 days', () => {
    const in20Days = new Date()
    in20Days.setDate(in20Days.getDate() + 20)
    const dateStr = in20Days.toISOString().split('T')[0]
    expect(getDocumentStatus(dateStr, true)).toBe('expiring_soon')
  })

  it('returns active for dates beyond 30 days', () => {
    const in60Days = new Date()
    in60Days.setDate(in60Days.getDate() + 60)
    const dateStr = in60Days.toISOString().split('T')[0]
    expect(getDocumentStatus(dateStr, true)).toBe('active')
  })
})

describe('getDaysUntilExpiry', () => {
  it('returns null for null input', () => {
    expect(getDaysUntilExpiry(null)).toBeNull()
  })

  it('returns negative number for past dates', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const result = getDaysUntilExpiry(yesterday.toISOString().split('T')[0])
    expect(result).toBeLessThan(0)
  })

  it('returns positive number for future dates', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 10)
    const result = getDaysUntilExpiry(tomorrow.toISOString().split('T')[0])
    expect(result).toBeGreaterThan(0)
  })
})

describe('formatDate', () => {
  it('returns dash for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('formats a valid date', () => {
    const result = formatDate('2025-06-15')
    expect(result).toMatch(/Jun 15, 2025/)
  })
})

describe('formatFileSize', () => {
  it('returns dash for null', () => {
    expect(formatFileSize(null)).toBe('—')
  })

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})

describe('getStatusColor', () => {
  it('returns green for active', () => {
    expect(getStatusColor('active')).toContain('green')
  })

  it('returns yellow for expiring_soon', () => {
    expect(getStatusColor('expiring_soon')).toContain('yellow')
  })

  it('returns red for expired', () => {
    expect(getStatusColor('expired')).toContain('red')
  })
})

describe('getStatusLabel', () => {
  it('returns human-readable labels', () => {
    expect(getStatusLabel('active')).toBe('Current')
    expect(getStatusLabel('expiring_soon')).toBe('Expiring Soon')
    expect(getStatusLabel('expired')).toBe('Expired')
    expect(getStatusLabel('missing')).toBe('Missing')
  })
})

describe('validateFile', () => {
  it('allows PDF files under 10MB', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 })
    expect(validateFile(file)).toBeNull()
  })

  it('rejects files over 10MB', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE + 1 })
    const result = validateFile(file)
    expect(result).not.toBeNull()
    expect(result).toContain('10MB')
  })

  it('rejects disallowed file types', () => {
    const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })
    Object.defineProperty(file, 'size', { value: 1024 })
    const result = validateFile(file)
    expect(result).not.toBeNull()
    expect(result).toContain('PDF')
  })

  it('allows JPEG images', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 })
    expect(validateFile(file)).toBeNull()
  })
})

describe('calculateComplianceScore', () => {
  it('returns 100 for empty compliance', () => {
    expect(calculateComplianceScore(0, 0)).toBe(100)
  })

  it('calculates percentage correctly', () => {
    expect(calculateComplianceScore(10, 8)).toBe(80)
  })

  it('returns 100 when all compliant', () => {
    expect(calculateComplianceScore(10, 10)).toBe(100)
  })

  it('returns 0 when none compliant', () => {
    expect(calculateComplianceScore(10, 0)).toBe(0)
  })
})

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Johnson Electric LLC')).toBe('johnson-electric-llc')
  })

  it('removes special characters', () => {
    expect(slugify('A & B Electric!')).toBe('a-b-electric')
  })
})

describe('getInitials', () => {
  it('gets two-letter initials', () => {
    expect(getInitials('Mike Johnson')).toBe('MJ')
  })

  it('handles single name', () => {
    expect(getInitials('Mike')).toBe('M')
  })
})
