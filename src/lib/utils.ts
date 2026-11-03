import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, parseISO, format, isValid } from 'date-fns'
import { DocumentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDocumentStatus(expiryDate: string | null, hasFile: boolean): DocumentStatus {
  if (!hasFile) return 'missing'
  if (!expiryDate) return 'active'
  
  const expiry = parseISO(expiryDate)
  if (!isValid(expiry)) return 'active'
  
  const daysUntilExpiry = differenceInDays(expiry, new Date())
  
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring_soon'
  return 'active'
}

export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const expiry = parseISO(expiryDate)
  if (!isValid(expiry)) return null
  return differenceInDays(expiry, new Date())
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  const parsed = parseISO(date)
  if (!isValid(parsed)) return '—'
  return format(parsed, 'MMM d, yyyy')
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'active': return 'text-green-700 bg-green-50 border-green-200'
    case 'expiring_soon': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'expired': return 'text-red-700 bg-red-50 border-red-200'
    case 'missing': return 'text-gray-700 bg-gray-50 border-gray-200'
    case 'pending': return 'text-blue-700 bg-blue-50 border-blue-200'
    default: return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'active': return 'Current'
    case 'expiring_soon': return 'Expiring Soon'
    case 'expired': return 'Expired'
    case 'missing': return 'Missing'
    case 'pending': return 'Pending'
    default: return status
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateComplianceScore(total: number, compliant: number): number {
  if (total === 0) return 100
  return Math.round((compliant / total) * 100)
}

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Only PDF, JPG, PNG, and WebP files are allowed.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be under 10MB.'
  }
  return null
}
