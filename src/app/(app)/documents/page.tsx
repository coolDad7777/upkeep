import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DocumentsContent } from '@/components/documents/DocumentsContent'
import { Metadata } from 'next'
import { withLiveDocumentStatuses } from '@/lib/utils'

export const metadata: Metadata = { title: 'Documents' }

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; person?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const query = supabase
    .from('documents')
    .select(`
      id, status, file_name, file_path, file_size, file_type,
      issue_date, expiry_date, notes, version, updated_at,
      document_type:document_types(id, name, description),
      person:people(id, first_name, last_name, type),
      vehicle:vehicles(id, make, model, plate)
    `)
    .eq('company_id', membership.company_id)
    .eq('is_superseded', false)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  // Status in the table is frozen at the last write. Filter after recomputing
  // it, or an expired license still stored as active never matches ?status=expired.
  const { data: documents } = await query
  const liveDocuments = withLiveDocumentStatuses(documents ?? []).filter((doc) =>
    !params.status || doc.status === params.status
  )

  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('id, name, applies_to, is_required')
    .or(`company_id.eq.${membership.company_id},company_id.is.null`)
    .order('sort_order')

  const { data: people } = await supabase
    .from('people')
    .select('id, first_name, last_name, type')
    .eq('company_id', membership.company_id)
    .eq('is_active', true)
    .order('last_name')

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, plate')
    .eq('company_id', membership.company_id)
    .eq('is_active', true)

  return (
    <DocumentsContent
      documents={liveDocuments as Record<string, unknown>[]}
      documentTypes={(documentTypes ?? []) as Record<string, unknown>[]}
      people={(people ?? []) as Record<string, unknown>[]}
      vehicles={(vehicles ?? []) as Record<string, unknown>[]}
      companyId={membership.company_id}
      role={membership.role}
      filterStatus={params.status}
    />
  )
}
