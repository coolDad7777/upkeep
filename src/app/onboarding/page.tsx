import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingFlow } from '@/components/shared/OnboardingFlow'

export const metadata = { title: 'Set up your company — CrewCompliant' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if they already have a company
  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single()

  if (membership) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return <OnboardingFlow userId={user.id} userEmail={user.email!} fullName={profile?.full_name || ''} />
}
