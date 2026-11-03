import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/shared/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's company
  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role, companies(id, name, industry, subscription_status, trial_ends_at, settings)')
    .eq('user_id', user.id)
    .order('joined_at')
    .limit(1)
    .single()

  // If no company, send to onboarding
  if (!membership) {
    redirect('/onboarding')
  }

  const company = (Array.isArray(membership.companies) ? membership.companies[0] : membership.companies) as Record<string, unknown>

  // Check if subscription is valid
  const subStatus = company.subscription_status as string
  if (['canceled', 'paused'].includes(subStatus)) {
    // Allow access to billing page only
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <AppShell
      user={{ id: user.id, email: user.email!, ...profile }}
      company={company as Record<string, string>}
      role={membership.role}
    >
      {children}
    </AppShell>
  )
}
