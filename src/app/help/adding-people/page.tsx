import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Adding People & Vehicles — CrewCompliant Help',
}

export default function AddingPeoplePage() {
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
        <p className="text-sm text-blue-700 font-medium mb-2">People & vehicles</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Adding people and vehicles</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">Person types</h2>
          <p>CrewCompliant tracks three types of people:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Employee</strong> — Direct employees of your company. Their licenses and certifications are tracked under your company's compliance score.</li>
            <li><strong>Subcontractor</strong> — Independent contractors who work on your jobs. Track their licenses and insurance separately from your employees.</li>
            <li><strong>Vendor</strong> — Suppliers, material providers, and service vendors whose certificates of insurance you may need to collect.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">How to add a person</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <strong>People</strong> from the main navigation.</li>
            <li>Click <strong>Add person</strong> (top-right).</li>
            <li>Fill in first name, last name, and type. Everything else is optional.</li>
            <li>Click <strong>Add person</strong> to save.</li>
          </ol>
          <p>The person will appear in your list immediately. Their compliance status will show as &quot;No docs&quot; until you upload or request their documents.</p>

          <h2 className="text-xl font-semibold text-gray-900">Email addresses</h2>
          <p>
            The email field is optional, but if you add it, you can use the <strong>Request document</strong>
            feature to email the person a secure link and ask them to upload their own documents.
            This is especially useful for subcontractors who need to submit their insurance certificates.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Adding vehicles</h2>
          <p>To add a company vehicle:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <strong>People</strong> and click the <strong>Vehicles</strong> tab.</li>
            <li>Click <strong>Add vehicle</strong>.</li>
            <li>Enter make, model, year (optional), and license plate (optional).</li>
            <li>Click <strong>Add vehicle</strong>.</li>
          </ol>
          <p>Common vehicle documents to track: registration, commercial auto insurance, DOT inspection, and any required permits.</p>

          <h2 className="text-xl font-semibold text-gray-900">Deactivating a person or vehicle</h2>
          <p>
            When someone leaves your crew or you retire a vehicle, open their detail page and use the
            menu (⋯) to deactivate them. Their documents and history are preserved, but they won&apos;t
            affect your compliance score or appear in reminder emails.
          </p>
          <p>
            You can reactivate them at any time.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Tips</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the search bar on the People page to quickly find someone by name.</li>
            <li>The colored pill next to each person shows their worst document status at a glance.</li>
            <li>Use the <strong>Notes</strong> field on person detail pages for info like license numbers, union membership IDs, or hire dates.</li>
          </ul>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Next: upload documents for your crew</p>
          <Link href="/help/uploading-documents" className="text-sm text-blue-700 hover:underline">How to upload and manage documents →</Link>
        </div>
      </article>
    </div>
  )
}
