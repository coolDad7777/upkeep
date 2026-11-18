import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { withLiveDocumentStatuses } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const companyId = membership.company_id

  // Fetch dashboard data
  const [
    { data: documents },
    { data: people },
    { data: vehicles },
    { data: auditLogs },
  ] = await Promise.all([
    supabase
      .from('documents')
      .select(`
        id, status, expiry_date, updated_at, file_name,
        document_type:document_types(name),
        person:people(first_name, last_name),
        vehicle:vehicles(make, model, plate)
      `)
      .eq('company_id', companyId)
      .eq('is_superseded', false)
      .order('expiry_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('people')
      .select('id, first_name, last_name, type, is_active')
      .eq('company_id', companyId)
      .eq('is_active', true),
    supabase
      .from('vehicles')
      .select('id, make, model, plate, is_active')
      .eq('company_id', companyId)
      .eq('is_active', true),
    supabase
      .from('audit_logs')
      .select('id, action, resource_type, metadata, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const liveDocuments = withLiveDocumentStatuses(documents ?? [])

  const stats = {
    total: liveDocuments.length,
    active: liveDocuments.filter(d => d.status === 'active').length,
    expiring: liveDocuments.filter(d => d.status === 'expiring_soon').length,
    expired: liveDocuments.filter(d => d.status === 'expired').length,
    missing: liveDocuments.filter(d => d.status === 'missing').length,
    people: people?.length ?? 0,
    vehicles: vehicles?.length ?? 0,
  }

  const compliance = stats.total > 0
    ? Math.round((stats.active / stats.total) * 100)
    : 0

  const urgentDocs = liveDocuments.filter(
    d => ['expiring_soon', 'expired', 'missing'].includes(d.status)
  ).slice(0, 10)

  return (
    <DashboardContent
      stats={{ ...stats, compliance }}
      urgentDocs={urgentDocs as Record<string, unknown>[]}
      recentActivity={(auditLogs ?? []) as Record<string, unknown>[]}
    />
  )
}
