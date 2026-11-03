import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RemindersContent } from '@/components/reminders/RemindersContent'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reminders' }

export default async function RemindersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  // Get upcoming expirations (next 60 days)
  const today = new Date()
  const in60Days = new Date(today)
  in60Days.setDate(in60Days.getDate() + 60)

  const { data: upcoming } = await supabase
    .from('documents')
    .select(`
      id, expiry_date, status,
      document_type:document_types(name),
      person:people(first_name, last_name, email),
      vehicle:vehicles(make, model, plate)
    `)
    .eq('company_id', membership.company_id)
    .eq('is_superseded', false)
    .lte('expiry_date', in60Days.toISOString().split('T')[0])
    .not('expiry_date', 'is', null)
    .order('expiry_date')

  const { data: recentLogs } = await supabase
    .from('reminder_logs')
    .select(`
      id, days_before, sent_at, recipient_email,
      document:documents(document_type:document_types(name), person:people(first_name, last_name))
    `)
    .order('sent_at', { ascending: false })
    .limit(20)

  const { data: company } = await supabase
    .from('companies')
    .select('settings')
    .eq('id', membership.company_id)
    .single()

  return (
    <RemindersContent
      upcoming={(upcoming ?? []) as Record<string, unknown>[]}
      recentLogs={(recentLogs ?? []) as Record<string, unknown>[]}
      settings={(company?.settings as Record<string, unknown>) || {}}
      companyId={membership.company_id}
      role={membership.role}
    />
  )
}
