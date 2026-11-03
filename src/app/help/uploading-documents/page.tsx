import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uploading & Managing Documents — CrewCompliant Help',
}

export default function UploadingDocumentsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Uploading and managing documents</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">Accepted file types</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>PDF</strong> — preferred for most documents. Best for text-heavy documents like licenses and certificates.</li>
            <li><strong>JPG / JPEG</strong> — photos of cards, labels, or stickers.</li>
            <li><strong>PNG</strong> — screenshots or scanned images.</li>
            <li><strong>WebP</strong> — modern image format from phones and browsers.</li>
          </ul>
          <p>Maximum file size: <strong>10 MB per file</strong>. If your PDF is too large, compress it with a free tool like Smallpdf or ilovepdf.com before uploading.</p>

          <h2 className="text-xl font-semibold text-gray-900">How to upload a document</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Open the person or vehicle you want to add a document for.</li>
            <li>Click <strong>Upload document</strong>.</li>
            <li>Select the <strong>document type</strong> (e.g., Journeyman License, General Liability Insurance).</li>
            <li>Enter the <strong>expiration date</strong>. This is what drives reminders.</li>
            <li>Optionally enter the issue date.</li>
            <li>Drag and drop or click to select a file. (You can skip the file and save the record without one.)</li>
            <li>Click <strong>Save document</strong>.</li>
          </ol>

          <h2 className="text-xl font-semibold text-gray-900">Document status labels</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-green-700">Current</strong> — Expiry date is more than 30 days away, or no expiry date set.</li>
            <li><strong className="text-yellow-700">Expiring soon</strong> — Expiry date is within the next 30 days.</li>
            <li><strong className="text-red-700">Expired</strong> — Expiry date has passed.</li>
            <li><strong className="text-gray-600">Missing</strong> — A record exists for this document type but no file has been uploaded.</li>
            <li><strong className="text-blue-700">Pending</strong> — A document request email has been sent and is awaiting a response.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">Replacing an expired document</h2>
          <p>When someone renews a license or gets a new certificate, upload a new version:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to the person or vehicle detail page.</li>
            <li>Click <strong>Upload document</strong> and choose the same document type.</li>
            <li>Enter the new expiry date and upload the new file.</li>
            <li>The old version is archived. The new version becomes the active record.</li>
          </ol>

          <h2 className="text-xl font-semibold text-gray-900">Saving a record without a file</h2>
          <p>
            You don&apos;t need a file to track a document. If you know a license number or expiration date
            but don&apos;t have a copy of the certificate, you can save the record with just the dates and notes.
            The file upload is optional.
          </p>
          <p>Use the <strong>Notes</strong> field for license numbers, policy numbers, or other identifiers.</p>

          <h2 className="text-xl font-semibold text-gray-900">Downloading a document</h2>
          <p>
            Click the download icon (↓) on any document with an uploaded file. You&apos;ll get a temporary
            download link that expires after 5 minutes for security.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Deleting a document</h2>
          <p>
            Documents can be deleted from the Documents page using the action menu (⋯). Deleted documents
            are removed permanently. If you need to archive a document instead, consider deactivating the
            person it belongs to.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Security note:</strong> All uploaded files are stored in a private bucket. They are
              never publicly accessible. Download links are signed and expire after 5 minutes.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/help/document-requests" className="text-sm text-blue-700 hover:underline">How to request documents →</Link>
          <Link href="/help/reminders" className="text-sm text-blue-700 hover:underline">Setting up reminders →</Link>
        </div>
      </article>
    </div>
  )
}
