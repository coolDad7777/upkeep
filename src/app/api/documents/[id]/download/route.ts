import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch document and verify ownership
  const { data: doc } = await supabase
    .from('documents')
    .select('id, file_path, file_name, company_id')
    .eq('id', id)
    .single()

  if (!doc || !doc.file_path) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Verify user is member of the company
  const { data: membership } = await supabase
    .from('company_members')
    .select('id')
    .eq('company_id', doc.company_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Generate signed URL (valid for 5 minutes)
  const { data: signedUrl } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.file_path, 300, {
      download: doc.file_name || true,
    })

  if (!signedUrl) {
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signedUrl.signedUrl)
}
