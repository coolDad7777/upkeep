import Link from 'next/link'
import { Shield, Search, Book, MessageCircle, Zap } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center — CrewCompliant',
  description: 'Learn how to use CrewCompliant to track licenses and compliance documents for your crew.'
}

const ARTICLES = [
  {
    category: 'Getting started',
    items: [
      { title: 'Quick start guide: set up your company in 10 minutes', href: '/help/getting-started' },
      { title: 'Adding employees and subcontractors', href: '/help/adding-people' },
      { title: 'Uploading your first document', href: '/help/uploading-documents' },
      { title: 'Understanding the compliance dashboard', href: '/help/dashboard' },
    ]
  },
  {
    category: 'Document management',
    items: [
      { title: 'Supported file types and size limits', href: '/help/file-types' },
      { title: 'How to replace an expired document', href: '/help/replace-document' },
      { title: 'Sending a document request to a subcontractor', href: '/help/document-requests' },
      { title: 'Document history and versions', href: '/help/document-history' },
    ]
  },
  {
    category: 'Reminders',
    items: [
      { title: 'How reminder emails work', href: '/help/reminders' },
      { title: 'Changing your reminder schedule', href: '/help/reminder-settings' },
      { title: 'Why did I get a reminder email?', href: '/help/why-reminder' },
    ]
  },
  {
    category: 'Billing',
    items: [
      { title: 'Plans and pricing', href: '/pricing' },
      { title: 'How to upgrade or downgrade', href: '/help/billing' },
      { title: 'Canceling your subscription', href: '/help/cancel' },
      { title: 'Refund policy', href: '/help/refunds' },
    ]
  },
  {
    category: 'Security and privacy',
    items: [
      { title: 'How your documents are stored and protected', href: '/help/security' },
      { title: 'Who can see your data', href: '/help/privacy' },
      { title: 'Exporting and deleting your data', href: '/help/data-export' },
    ]
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">CrewCompliant</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-blue-700 hover:underline">
            Back to app →
          </Link>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600 mb-10">Find answers, learn how CrewCompliant works, and get support.</p>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Link href="/help/getting-started" className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
            <Zap className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Quick start guide</h3>
            <p className="text-sm text-gray-500">Set up in 10 minutes</p>
          </Link>
          <Link href="/contact" className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
            <MessageCircle className="w-5 h-5 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Contact support</h3>
            <p className="text-sm text-gray-500">Usually reply within 1 business day</p>
          </Link>
          <Link href="/pricing" className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
            <Book className="w-5 h-5 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Plans & pricing</h3>
            <p className="text-sm text-gray-500">Starting at $49/month</p>
          </Link>
        </div>

        {/* Article index */}
        <div className="space-y-8">
          {ARTICLES.map(section => (
            <div key={section.category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.category}</h2>
              <ul className="space-y-2">
                {section.items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-blue-700 hover:underline text-sm">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> CrewCompliant is an administrative document tracking tool. It does not provide legal, compliance, or licensing advice. The compliance scores and status indicators reflect document expiration dates as entered by users — not actual legal or regulatory standing. Always consult qualified professionals for regulatory requirements in your jurisdiction.
          </p>
        </div>
      </div>
    </div>
  )
}
