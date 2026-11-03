import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingContent } from '@/components/billing/BillingContent'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Billing' }

export default async function BillingPage() {
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
    .select('id, name, subscription_status, subscription_plan, trial_ends_at, stripe_customer_id')
    .eq('id', membership.company_id)
    .single()

  if (!company) redirect('/dashboard')

  return (
    <BillingContent
      company={company as Record<string, string>}
      role={membership.role}
      userId={user.id}
    />
  )
}
