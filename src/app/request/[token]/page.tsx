import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicDocumentUpload } from '@/components/documents/PublicDocumentUpload'
import { createServiceClient } from '@/lib/supabase/server'
import { isRequestToken, requestBlockReason } from '@/lib/document-request'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Upload a requested document' }

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default async function DocumentRequestPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let content = (
    <Message
      title="This link is not valid"
      body="Ask the person who sent it to request the document again."
    />
  )

  if (isRequestToken(token)) {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('document_requests')
      .select(`
        status, expires_at, message,
        person:people(first_name),
        document_type:document_types(name),
        company:companies(name)
      `)
      .eq('token', token)
      .maybeSingle()

    if (data) {
      const block = requestBlockReason(data.status, data.expires_at)
      const person = one(data.person as { first_name: string } | { first_name: string }[] | null)
      const docType = one(data.document_type as { name: string } | { name: string }[] | null)
      const company = one(data.company as { name: string } | { name: string }[] | null)
      const greeting = person?.first_name ? `Hi ${person.first_name}. ` : ''
      const companyName = company?.name || 'A company'
      const docName = docType?.name || 'a document'

      if (block === 'completed') {
        content = (
          <Message
            title="Already uploaded"
            body="This request already has a document. You can close this page."
          />
        )
      } else if (block) {
        content = (
          <Message
            title="This link has expired"
            body="Ask the person who sent it for a new upload link."
          />
        )
      } else {
        content = (
          <Card className="w-full max-w-md shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Upload {docName}</CardTitle>
              <CardDescription>
                {greeting}{companyName} asked you to upload this document. No account is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.message && (
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap">
                  {data.message}
                </p>
              )}
              <PublicDocumentUpload token={token} />
            </CardContent>
          </Card>
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">CrewCompliant</span>
      </Link>
      {content}
    </div>
  )
}
