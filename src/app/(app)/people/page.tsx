import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PeopleContent } from '@/components/people/PeopleContent'
import { Metadata } from 'next'
import { withLiveNestedDocuments } from '@/lib/utils'

export const metadata: Metadata = { title: 'People' }

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: people } = await supabase
    .from('people')
    .select(`
      id, type, first_name, last_name, email, phone, job_title, company_name, is_active, created_at,
      documents:documents(id, status, expiry_date, document_type:document_types(name))
    `)
    .eq('company_id', membership.company_id)
    .order('last_name')

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, plate, is_active,
      documents:documents(id, status, expiry_date, document_type:document_types(name))
    `)
    .eq('company_id', membership.company_id)
    .order('make')

  return (
    <PeopleContent
      people={withLiveNestedDocuments(people ?? []) as Record<string, unknown>[]}
      vehicles={withLiveNestedDocuments(vehicles ?? []) as Record<string, unknown>[]}
      companyId={membership.company_id}
      role={membership.role}
    />
  )
}
