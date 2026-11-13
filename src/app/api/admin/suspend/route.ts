import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/authz'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isPlatformAdmin(process.env.ADMIN_EMAILS, user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { company_id, suspend } = await request.json()

  const serviceSupabase = await createServiceClient()
  const { error } = await serviceSupabase
    .from('companies')
    .update({ is_suspended: suspend })
    .eq('id', company_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
