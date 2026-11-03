import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import { VehicleDetailContent } from '@/components/people/VehicleDetailContent'

export const metadata: Metadata = { title: 'Vehicle Details' }

export default async function VehicleDetailPage({
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

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, make, model, year, plate, vin, is_active, notes, created_at')
    .eq('id', id)
    .eq('company_id', membership.company_id)
    .single()

  if (!vehicle) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id, status, file_name, file_path, file_size, issue_date, expiry_date, notes, version, updated_at,
      document_type:document_types(id, name, description)
    `)
    .eq('vehicle_id', id)
    .eq('company_id', membership.company_id)
    .eq('is_superseded', false)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('id, name, applies_to, is_required')
    .or(`company_id.eq.${membership.company_id},company_id.is.null`)
    .in('applies_to', ['vehicle'])
    .order('sort_order')

  return (
    <VehicleDetailContent
      vehicle={vehicle as Record<string, unknown>}
      documents={(documents ?? []) as Record<string, unknown>[]}
      documentTypes={(documentTypes ?? []) as Record<string, unknown>[]}
      companyId={membership.company_id}
      role={membership.role}
    />
  )
}
