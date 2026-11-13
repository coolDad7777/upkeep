import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { isCronRequestAuthorized } from '@/lib/authz'

const resend = new Resend(process.env.RESEND_API_KEY)

// This endpoint is called by a cron job (Render cron or Supabase edge function)
// It should be secured with a secret token

export async function POST(request: NextRequest) {
  if (!isCronRequestAuthorized(process.env.CRON_SECRET, request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured' }, { status: 500 })
  }

  const supabase = await createServiceClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find all active companies
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, settings, subscription_status')
    .in('subscription_status', ['trialing', 'active'])
    .eq('is_suspended', false)

  if (!companies) {
    return NextResponse.json({ processed: 0 })
  }

  let emailsSent = 0

  for (const company of companies) {
    const reminderDays: number[] = (company.settings as Record<string, number[]>)?.reminder_defaults || [60, 30, 14, 7]

    // Get all non-superseded documents with expiry dates for this company
    const { data: documents } = await supabase
      .from('documents')
      .select(`
        id, expiry_date, status, company_id,
        document_type:document_types(name),
        person:people(id, first_name, last_name, email),
        vehicle:vehicles(id, make, model, plate)
      `)
      .eq('company_id', company.id)
      .eq('is_superseded', false)
      .not('expiry_date', 'is', null)
      .neq('status', 'missing')

    if (!documents) continue

    // Get company owner emails
    const { data: ownerMemberships } = await supabase
      .from('company_members')
      .select('user_id')
      .eq('company_id', company.id)
      .in('role', ['owner', 'admin'])

    const ownerEmails: string[] = []
    if (ownerMemberships) {
      for (const m of ownerMemberships) {
        const { data: userData } = await supabase.auth.admin.getUserById(m.user_id)
        if (userData.user?.email) ownerEmails.push(userData.user.email)
      }
    }

    for (const doc of documents) {
      const expiryDate = new Date(doc.expiry_date!)
      const diffMs = expiryDate.getTime() - today.getTime()
      const diffDays = Math.round(diffMs / 86400000)

      // Find matching reminder threshold
      const matchingDay = reminderDays.find(d => d === diffDays)
        || (diffDays < 0 && reminderDays.includes(-1) ? -1 : null)
        || (diffDays < -7 && reminderDays.includes(-7) ? -7 : null)
        || (diffDays < -30 && reminderDays.includes(-30) ? -30 : null)

      if (!matchingDay && matchingDay !== 0) continue

      const docType = doc.document_type as unknown as Record<string, string> | null
      const person = doc.person as unknown as Record<string, string> | null
      const vehicle = doc.vehicle as unknown as Record<string, string> | null
      const entityName = person
        ? `${person.first_name} ${person.last_name}`
        : vehicle
        ? `${vehicle.make} ${vehicle.model}${vehicle.plate ? ` (${vehicle.plate})` : ''}`
        : 'Unknown'

      // Determine recipients: company owners + person if they have email
      const recipients = [...ownerEmails]
      if (person?.email && !recipients.includes(person.email)) {
        recipients.push(person.email)
      }

      for (const recipientEmail of recipients) {
        // Check if reminder already sent
        const { data: existing } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('document_id', doc.id)
          .eq('days_before', matchingDay)
          .eq('recipient_email', recipientEmail)
          .maybeSingle()

        if (existing) continue

        // Send reminder email
        const subject = diffDays < 0
          ? `⚠️ Expired: ${docType?.name} for ${entityName}`
          : diffDays === 0
          ? `⚠️ Expires today: ${docType?.name} for ${entityName}`
          : `Reminder: ${docType?.name} for ${entityName} expires in ${diffDays} days`

        const urgencyColor = diffDays < 0 ? '#dc2626' : diffDays <= 7 ? '#ea580c' : '#d97706'

        const { error: sendError } = await resend.emails.send({
            from: `CrewCompliant <reminders@crewcompliant.com>`,
            to: recipientEmail,
            subject,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
                <div style="background:${urgencyColor};color:white;padding:12px 20px;border-radius:8px;margin-bottom:20px">
                  <strong>${diffDays < 0 ? 'EXPIRED' : diffDays === 0 ? 'EXPIRES TODAY' : `EXPIRES IN ${diffDays} DAYS`}</strong>
                </div>
                <h2 style="color:#111;margin-bottom:8px">${docType?.name}</h2>
                <p style="color:#555;margin-bottom:16px">for <strong>${entityName}</strong> at ${company.name}</p>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                  <tr style="background:#f9fafb">
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Document</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb">${docType?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Person/Vehicle</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb">${entityName}</td>
                  </tr>
                  <tr style="background:#f9fafb">
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Expiration date</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:${urgencyColor};font-weight:600">${new Date(doc.expiry_date!).toLocaleDateString()}</td>
                  </tr>
                </table>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                  View in CrewCompliant →
                </a>
                <p style="margin-top:24px;font-size:12px;color:#9ca3af">
                  You're receiving this because you manage compliance tracking at ${company.name} through CrewCompliant.
                  This is an administrative reminder only — not legal advice.
                </p>
              </div>
            `,
        })

        if (sendError) {
          console.error('Reminder email failed:', sendError)
          continue
        }

        const { error: logError } = await supabase.from('reminder_logs').insert({
          document_id: doc.id,
          days_before: matchingDay,
          recipient_email: recipientEmail,
        })

        if (logError) {
          console.error('Reminder log failed:', logError)
          continue
        }

        emailsSent++
      }
    }
  }

  return NextResponse.json({ processed: companies.length, emailsSent })
}
