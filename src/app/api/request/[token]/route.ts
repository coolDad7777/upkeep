import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  REQUEST_UPLOAD_MAX_BYTES,
  buildRequestStoragePath,
  dateRangeError,
  extensionForMime,
  isRequestToken,
  requestBlockReason,
  sanitizeFileName,
} from '@/lib/document-request'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface StoredRequest {
  id: string
  status: string
  expires_at: string
  company_id: string
  person_id: string | null
  vehicle_id: string | null
  document_type_id: string
  requested_by: string
}

function optionalDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  if (!isRequestToken(token)) {
    return NextResponse.json({ error: 'This link is not valid.' }, { status: 404 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Upload could not be read.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 })
  }
  if (file.size > REQUEST_UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: 'File size must be under 10MB.' }, { status: 400 })
  }

  const extension = extensionForMime(file.type)
  if (!extension) {
    return NextResponse.json({ error: 'Only PDF, JPG, PNG, and WebP files are allowed.' }, { status: 400 })
  }

  const issueDate = optionalDate(form.get('issue_date'))
  const expiryDate = optionalDate(form.get('expiry_date'))
  const rangeError = dateRangeError(issueDate, expiryDate)
  if (rangeError) {
    return NextResponse.json({ error: rangeError }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: stored, error: loadError } = await supabase
    .from('document_requests')
    .select('id, status, expires_at, company_id, person_id, vehicle_id, document_type_id, requested_by')
    .eq('token', token)
    .maybeSingle()

  if (loadError || !stored) {
    return NextResponse.json({ error: 'This link is not valid.' }, { status: 404 })
  }

  const row = stored as StoredRequest
  const block = requestBlockReason(row.status, row.expires_at)
  if (block === 'completed') {
    return NextResponse.json({ error: 'This document was already uploaded.' }, { status: 409 })
  }
  if (block) {
    return NextResponse.json({ error: 'This link has expired.' }, { status: 410 })
  }
  if (!row.person_id && !row.vehicle_id) {
    return NextResponse.json({ error: 'This request is missing the person or vehicle it belongs to.' }, { status: 422 })
  }

  const storagePath = buildRequestStoragePath({
    companyId: row.company_id,
    personId: row.person_id,
    vehicleId: row.vehicle_id,
    documentTypeId: row.document_type_id,
    extension,
  })
  if (!storagePath) {
    return NextResponse.json({ error: 'This request cannot accept an upload.' }, { status: 422 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('document request storage upload failed')
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  const { data: created, error: insertError } = await supabase
    .from('documents')
    .insert({
      company_id: row.company_id,
      document_type_id: row.document_type_id,
      person_id: row.person_id,
      vehicle_id: row.vehicle_id,
      file_name: sanitizeFileName(file.name || `document.${extension}`),
      file_path: storagePath,
      file_size: file.size,
      file_type: file.type,
      issue_date: issueDate,
      expiry_date: expiryDate,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    await supabase.storage.from('documents').remove([storagePath])
    console.error('document request insert failed')
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  const now = new Date().toISOString()
  const { data: completed, error: completeError } = await supabase
    .from('document_requests')
    .update({ status: 'completed', completed_at: now })
    .eq('id', row.id)
    .eq('status', 'pending')
    .gt('expires_at', now)
    .select('id')

  if (completeError || !completed || completed.length === 0) {
    await supabase.from('documents').delete().eq('id', created.id)
    await supabase.storage.from('documents').remove([storagePath])
    return NextResponse.json({ error: 'This link has expired.' }, { status: 410 })
  }

  let supersede = supabase
    .from('documents')
    .update({ is_superseded: true })
    .eq('company_id', row.company_id)
    .eq('document_type_id', row.document_type_id)
    .eq('is_superseded', false)
    .neq('id', created.id)
  supersede = row.person_id
    ? supersede.eq('person_id', row.person_id)
    : supersede.eq('vehicle_id', row.vehicle_id)
  const { error: supersedeError } = await supersede
  if (supersedeError) {
    console.error('document request supersede failed')
  }

  await supabase.from('audit_logs').insert({
    company_id: row.company_id,
    user_id: null,
    action: 'document.uploaded',
    resource_type: 'document',
    resource_id: created.id,
    metadata: { source: 'document_request', requested_by: row.requested_by },
  })

  return NextResponse.json({ success: true })
}
