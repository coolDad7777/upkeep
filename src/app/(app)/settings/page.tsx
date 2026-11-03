import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsContent } from '@/components/settings/SettingsContent'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
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
    .select('id, name, industry, settings')
    .eq('id', membership.company_id)
    .single()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <SettingsContent
      company={company as Record<string, unknown>}
      profile={{ full_name: profile?.full_name || '', email: user.email! }}
      role={membership.role}
      userId={user.id}
    />
  )
}
