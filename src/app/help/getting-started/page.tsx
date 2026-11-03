import Link from 'next/link'
import { Shield, CheckCircle2 } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quick Start Guide — CrewCompliant Help',
}

export default function GettingStartedPage() {
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
        <p className="text-sm text-blue-700 font-medium mb-2">Getting started</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick start guide: set up your company in 10 minutes</h1>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            <strong>What you'll accomplish:</strong> Add your company, add your first employee, upload their first document, and verify that automatic reminders are on. Most people finish in under 10 minutes.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Step 1: Create your company</h2>
          <p className="text-gray-700">When you first sign up, CrewCompliant will ask for your company name and industry. Choose "Electrical Contractor" if that's your trade — we'll pre-load the most common document types for you (master license, journeyman license, insurance certificates, etc.).</p>

          <h2 className="text-xl font-semibold text-gray-900">Step 2: Add your first person</h2>
          <p className="text-gray-700">Go to <strong>People</strong> → <strong>Add person</strong>. Fill in:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>First and last name</li>
            <li>Type: Employee, Subcontractor, or Vendor</li>
            <li>Email address (optional — needed for sending document requests)</li>
            <li>Job title (optional)</li>
          </ul>
          <p className="text-gray-700">Click <strong>Add person</strong>. That's it.</p>

          <h2 className="text-xl font-semibold text-gray-900">Step 3: Upload a document</h2>
          <p className="text-gray-700">Click on the person you just added. You'll see a list of document types with empty slots. Click <strong>Upload document</strong> on any of them.</p>
          <p className="text-gray-700">Upload a PDF, JPG, or PNG of the document. Add the expiration date. Click save.</p>
          <p className="text-gray-700"><strong>No file available?</strong> You can save a record without a file — useful to note that a document exists but you don't have a copy yet.</p>

          <h2 className="text-xl font-semibold text-gray-900">Step 4: Check your reminder settings</h2>
          <p className="text-gray-700">Go to <strong>Settings</strong> → <strong>Company settings</strong> → <strong>Email reminder schedule</strong>.</p>
          <p className="text-gray-700">By default, you'll get reminders 60, 30, 14, and 7 days before each document expires. Adjust these if you prefer different intervals.</p>

          <h2 className="text-xl font-semibold text-gray-900">You're done</h2>
          <p className="text-gray-700">That's the core setup. CrewCompliant will now send you reminder emails before your documents expire.</p>
          <p className="text-gray-700">The next step most contractors take:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Add the rest of your crew (go to People → Add person for each)</li>
            <li>Upload or request their documents</li>
            <li>Check the dashboard — it'll show you what's current, expiring, expired, or missing</li>
          </ul>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> The compliance percentage on your dashboard reflects document expiration dates only. It is an administrative tracking tool — not a legal or regulatory compliance certification.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Was this helpful? Questions?</p>
          <Link href="/contact" className="text-sm text-blue-700 hover:underline">Contact support →</Link>
        </div>
      </article>
    </div>
  )
}
