import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsContent } from '@/components/reports/ReportsContent'
import { Metadata } from 'next'
import { withLiveDocumentStatuses } from '@/lib/utils'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', membership.company_id)
    .single()

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id, status, expiry_date, updated_at,
      document_type:document_types(name, is_required),
      person:people(first_name, last_name, type),
      vehicle:vehicles(make, model, plate)
    `)
    .eq('company_id', membership.company_id)
    .eq('is_superseded', false)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  return (
    <ReportsContent
      documents={withLiveDocumentStatuses(documents ?? []) as Record<string, unknown>[]}
      companyName={company?.name || 'Your Company'}
      companyId={membership.company_id}
    />
  )
}
