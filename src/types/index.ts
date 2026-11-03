export type UserRole = 'owner' | 'admin' | 'staff' | 'viewer'

export type PersonType = 'employee' | 'subcontractor' | 'vendor'

export type DocumentStatus = 'active' | 'expiring_soon' | 'expired' | 'missing' | 'pending'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'

export type ReminderDay = 60 | 30 | 14 | 7 | 0 | -1 | -7 | -30

export interface Company {
  id: string
  name: string
  industry: string
  slug: string
  owner_id: string
  subscription_status: SubscriptionStatus
  subscription_plan: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  trial_ends_at: string | null
  logo_url: string | null
  settings: CompanySettings
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  timezone: string
  reminder_defaults: ReminderDay[]
  require_expiry_date: boolean
  allow_document_requests: boolean
}

export interface CompanyMember {
  id: string
  company_id: string
  user_id: string
  role: UserRole
  invited_by: string | null
  joined_at: string
  user?: User
}

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Person {
  id: string
  company_id: string
  type: PersonType
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  job_title: string | null
  company_name: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  documents?: Document[]
  compliance_score?: number
}

export interface Vehicle {
  id: string
  company_id: string
  make: string
  model: string
  year: number
  vin: string | null
  plate: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  documents?: Document[]
}

export interface DocumentType {
  id: string
  company_id: string | null
  name: string
  description: string | null
  applies_to: ('person' | 'vehicle' | 'company')[]
  is_required: boolean
  reminder_days: ReminderDay[]
  is_system: boolean
  created_at: string
}

export interface Document {
  id: string
  company_id: string
  document_type_id: string
  person_id: string | null
  vehicle_id: string | null
  file_name: string | null
  file_path: string | null
  file_size: number | null
  file_type: string | null
  issue_date: string | null
  expiry_date: string | null
  status: DocumentStatus
  notes: string | null
  uploaded_by: string | null
  version: number
  created_at: string
  updated_at: string
  document_type?: DocumentType
  person?: Person
  vehicle?: Vehicle
}

export interface DocumentRequest {
  id: string
  company_id: string
  person_id: string | null
  vehicle_id: string | null
  document_type_id: string
  requested_by: string
  token: string
  message: string | null
  status: 'pending' | 'completed' | 'expired'
  expires_at: string
  completed_at: string | null
  created_at: string
  document_type?: DocumentType
  person?: Person
}

export interface ReminderLog {
  id: string
  document_id: string
  days_before: number
  sent_at: string
  recipient_email: string
}

export interface AuditLog {
  id: string
  company_id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface DashboardStats {
  total_documents: number
  active_documents: number
  expiring_soon: number
  expired: number
  missing: number
  compliance_score: number
  people_count: number
  vehicles_count: number
}

export interface ComplianceReport {
  generated_at: string
  company_name: string
  items: ComplianceReportItem[]
  summary: {
    total: number
    compliant: number
    expiring: number
    expired: number
    missing: number
  }
}

export interface ComplianceReportItem {
  entity_name: string
  entity_type: string
  document_type: string
  status: DocumentStatus
  expiry_date: string | null
  days_until_expiry: number | null
  last_updated: string | null
}
