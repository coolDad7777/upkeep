import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PersonDetailContent } from '@/components/people/PersonDetailContent'
import { withLiveDocumentStatuses } from '@/lib/utils'

export const metadata: Metadata = { title: 'Person Details' }

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: person } = await supabase
    .from('people')
    .select('id, type, first_name, last_name, email, phone, job_title, company_name, is_active, notes, created_at')
    .eq('id', id)
    .eq('company_id', membership.company_id)
    .single()

  if (!person) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id, status, file_name, file_path, file_size, issue_date, expiry_date, notes, version, updated_at,
      document_type:document_types(id, name, description)
    `)
    .eq('person_id', id)
    .eq('company_id', membership.company_id)
    .eq('is_superseded', false)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('id, name, applies_to, is_required')
    .or(`company_id.eq.${membership.company_id},company_id.is.null`)
    .in('applies_to', ['person', 'employee', 'subcontractor', 'vendor', person.type])
    .order('sort_order')

  const { data: documentRequests } = await supabase
    .from('document_requests')
    .select('id, document_type_id, status, sent_at, expires_at, document_type:document_types(name)')
    .eq('person_id', id)
    .eq('company_id', membership.company_id)
    .order('sent_at', { ascending: false })
    .limit(10)

  return (
    <PersonDetailContent
      person={person as Record<string, unknown>}
      documents={withLiveDocumentStatuses(documents ?? []) as Record<string, unknown>[]}
      documentTypes={(documentTypes ?? []) as Record<string, unknown>[]}
      documentRequests={(documentRequests ?? []) as Record<string, unknown>[]}
      companyId={membership.company_id}
      role={membership.role}
    />
  )
}
