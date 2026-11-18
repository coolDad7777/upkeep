import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withLiveDocumentStatuses } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id, status, file_name, issue_date, expiry_date, notes, version, updated_at,
      document_type:document_types(name),
      person:people(first_name, last_name, email, type),
      vehicle:vehicles(make, model, plate)
    `)
    .eq('company_id', membership.company_id)
    .eq('is_superseded', false)

  const headers = ['ID', 'Document Type', 'Entity', 'Entity Type', 'Status', 'Issue Date', 'Expiry Date', 'File Name', 'Notes', 'Updated At']
  const rows = withLiveDocumentStatuses(documents || []).map(doc => {
    const docType = (doc.document_type as unknown) as Record<string, string> | null
    const person = (doc.person as unknown) as Record<string, string> | null
    const vehicle = (doc.vehicle as unknown) as Record<string, string> | null
    return [
      doc.id,
      docType?.name || '',
      person ? `${person.first_name} ${person.last_name}` : vehicle ? `${vehicle.make} ${vehicle.model}` : '',
      person ? person.type : 'vehicle',
      doc.status,
      doc.issue_date || '',
      doc.expiry_date || '',
      doc.file_name || '',
      doc.notes || '',
      doc.updated_at,
    ]
  })

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="crewcompliant-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
