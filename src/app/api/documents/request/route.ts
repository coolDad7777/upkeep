import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { emailDisplayName, escapeHtml } from '@/lib/document-request'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { company_id, person_id, document_type_id, message } = body

  if (!company_id || !person_id || !document_type_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify membership
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', company_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin', 'staff'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get person details
  const { data: person } = await supabase
    .from('people')
    .select('id, first_name, last_name, email')
    .eq('id', person_id)
    .eq('company_id', company_id)
    .single()

  if (!person || !person.email) {
    return NextResponse.json({ error: 'Person not found or has no email address' }, { status: 400 })
  }

  // Get document type
  const { data: docType } = await supabase
    .from('document_types')
    .select('id, name')
    .eq('id', document_type_id)
    .single()

  if (!docType) {
    return NextResponse.json({ error: 'Document type not found' }, { status: 400 })
  }

  // Get company info
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', company_id)
    .single()

  // Create request record
  const serviceSupabase = await createServiceClient()
  const { data: docRequest, error: requestError } = await serviceSupabase
    .from('document_requests')
    .insert({
      company_id,
      person_id,
      document_type_id,
      requested_by: user.id,
      message: message || null,
    })
    .select('id, token')
    .single()

  if (requestError || !docRequest) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl || !process.env.RESEND_API_KEY) {
    await serviceSupabase.from('document_requests').delete().eq('id', docRequest.id)
    return NextResponse.json({ error: 'Email is not configured. Contact support.' }, { status: 503 })
  }

  const uploadUrl = `${appUrl}/request/${docRequest.token}`
  const safeMessage = typeof message === 'string' ? message : ''

  let emailSent = false
  try {
    const result = await resend.emails.send({
      from: `${emailDisplayName(company?.name || 'CrewCompliant')} <noreply@crewcompliant.com>`,
      to: person.email,
      subject: `Document requested: ${docType.name.replace(/[\r\n]/g, ' ').slice(0, 200)}`,
      html: `
        <p>Hi ${escapeHtml(person.first_name)},</p>
        <p>${escapeHtml(company?.name || 'Your employer')} is requesting your <strong>${escapeHtml(docType.name)}</strong>.</p>
        ${safeMessage ? `<p>${escapeHtml(safeMessage)}</p>` : ''}
        <p><a href="${escapeHtml(uploadUrl)}" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Upload Document</a></p>
        <p style="font-size:12px;color:#6b7280;">This link expires in 7 days. No account required — just click and upload.</p>
      `,
    })
    emailSent = !result.error
  } catch {
    emailSent = false
  }

  if (!emailSent) {
    await serviceSupabase.from('document_requests').delete().eq('id', docRequest.id)
    return NextResponse.json({ error: 'Could not send the request email. Try again.' }, { status: 502 })
  }

  // Audit log (fire and forget)
  void serviceSupabase.from('audit_logs').insert({
    company_id,
    user_id: user.id,
    action: 'document.requested',
    resource_type: 'document_request',
    resource_id: person_id,
    metadata: {
      document_type: docType.name,
      recipient: `${person.first_name} ${person.last_name}`,
      email: person.email,
    },
  })

  return NextResponse.json({ success: true })
}
