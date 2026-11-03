import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminContent } from '@/components/admin/AdminContent'

export const metadata = { title: 'Admin — CrewCompliant' }

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin status
  const isAdmin = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email!)
  if (!isAdmin) redirect('/dashboard')

  // Fetch all companies
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      id, name, industry, subscription_status, subscription_plan, trial_ends_at, created_at, is_suspended,
      stripe_customer_id
    `)
    .order('created_at', { ascending: false })

  // Fetch member counts per company
  const { data: memberCounts } = await supabase
    .from('company_members')
    .select('company_id')

  const memberCountMap: Record<string, number> = {}
  memberCounts?.forEach(m => {
    memberCountMap[m.company_id] = (memberCountMap[m.company_id] || 0) + 1
  })

  // Document counts
  const { data: docCounts } = await supabase
    .from('documents')
    .select('company_id, status')

  const docCountMap: Record<string, { total: number; expired: number; missing: number }> = {}
  docCounts?.forEach(d => {
    if (!docCountMap[d.company_id]) {
      docCountMap[d.company_id] = { total: 0, expired: 0, missing: 0 }
    }
    docCountMap[d.company_id].total++
    if (d.status === 'expired') docCountMap[d.company_id].expired++
    if (d.status === 'missing') docCountMap[d.company_id].missing++
  })

  // Support tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, subject, email, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20)

  const stats = {
    total: companies?.length || 0,
    trialing: companies?.filter(c => c.subscription_status === 'trialing').length || 0,
    active: companies?.filter(c => c.subscription_status === 'active').length || 0,
    canceled: companies?.filter(c => c.subscription_status === 'canceled').length || 0,
    past_due: companies?.filter(c => c.subscription_status === 'past_due').length || 0,
  }

  return (
    <AdminContent
      companies={(companies || []).map(c => ({
        ...c,
        member_count: memberCountMap[c.id] || 0,
        doc_count: docCountMap[c.id]?.total || 0,
        expired_count: docCountMap[c.id]?.expired || 0,
      })) as Record<string, unknown>[]}
      stats={stats}
      tickets={(tickets || []) as Record<string, unknown>[]}
    />
  )
}
