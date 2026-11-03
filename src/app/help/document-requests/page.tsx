import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Document Requests — CrewCompliant Help',
}

export default function DocumentRequestsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">CrewCompliant</span>
          </Link>
          <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900">← Help Center</Link>
        </div>
      </nav>

      <article className="py-12 px-4 sm:px-6 max-w-2xl mx-auto">
        <p className="text-sm text-blue-700 font-medium mb-2">Documents</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Requesting documents from your crew</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">What is a document request?</h2>
          <p>
            A document request lets you email a subcontractor, employee, or vendor a secure link so they
            can upload their own document — without needing to create a CrewCompliant account.
          </p>
          <p>
            This is ideal for collecting certificates of insurance from subcontractors, or asking
            employees to submit updated licenses when they renew them.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">How to send a document request</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Make sure the person has an email address in their profile. (Go to People → click the person → check their contact info.)</li>
            <li>Open the person&apos;s detail page.</li>
            <li>Click <strong>Request</strong> (next to the Upload button).</li>
            <li>Select the document type you need.</li>
            <li>Optionally add a personal message, like &ldquo;Hi, please send your updated COI before your next job.&rdquo;</li>
            <li>Click <strong>Send request</strong>.</li>
          </ol>

          <h2 className="text-xl font-semibold text-gray-900">What the recipient receives</h2>
          <p>
            The person gets an email from CrewCompliant with a secure upload link. The link allows them to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>See which document type you&apos;re requesting.</li>
            <li>Upload a file (PDF, JPG, PNG) directly from their phone or computer.</li>
            <li>Enter the expiry date of the document.</li>
          </ul>
          <p>
            They do not need to create an account or log in. The link expires after <strong>7 days</strong>.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">After they respond</h2>
          <p>
            Once they upload, the document appears in their profile in CrewCompliant automatically.
            The document request status changes to &quot;fulfilled.&quot; You&apos;ll also see the document in
            your Documents view with the file they uploaded and the expiry date they entered.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Tips</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Add email addresses for all subcontractors — document requests are the easiest way to collect their COIs.</li>
            <li>If a link expires, just send a new request from the same person&apos;s profile.</li>
            <li>You can see all pending and fulfilled requests on the person&apos;s detail page under &quot;Document requests.&quot;</li>
          </ul>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Privacy note:</strong> The secure upload link is unique and single-use. We never
              share the recipient&apos;s email address with third parties, and the uploaded file is stored
              encrypted in your private document storage.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/help/uploading-documents" className="text-sm text-blue-700 hover:underline">← Uploading documents</Link>
          <Link href="/help/reminders" className="text-sm text-blue-700 hover:underline">Setting up reminders →</Link>
        </div>
      </article>
    </div>
  )
}
