import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageSquare, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact — CrewCompliant',
  description: 'Get help with CrewCompliant. Reach our support team by email or chat.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">CrewCompliant</Link>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">Help center</Link>
            <Link href="/login" className="text-sm text-blue-700 font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact support</h1>
        <p className="text-lg text-gray-600 mb-10">
          We&apos;re here to help. Pick the option that works best for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="font-semibold text-gray-900 mb-1">Email support</h2>
              <p className="text-sm text-gray-500 mb-3">
                We reply within one business day. Include your company name and a description of the issue.
              </p>
              <a
                href="mailto:support@crewcompliant.com"
                className="text-sm font-medium text-blue-700 hover:underline flex items-center gap-1"
              >
                support@crewcompliant.com <ExternalLink className="w-3 h-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-green-700" />
              </div>
              <h2 className="font-semibold text-gray-900 mb-1">In-app chat</h2>
              <p className="text-sm text-gray-500 mb-3">
                Signed in? Use the chat widget inside the app for the fastest response from our team.
              </p>
              <Link href="/dashboard" className="text-sm font-medium text-green-700 hover:underline flex items-center gap-1">
                Open the app <ExternalLink className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Support hours</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Monday – Friday, 8 AM – 6 PM Central Time. We will reply to weekend messages on the next business day.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How do I reset my password?',
              a: 'Go to the login page and click "Forgot password." We will send you a reset link by email.',
            },
            {
              q: 'Can I add more than one company?',
              a: 'Each CrewCompliant account is linked to one company. To manage multiple companies, create a separate account for each.',
            },
            {
              q: 'What file types can I upload?',
              a: 'PDF, JPG, PNG, and WebP files up to 10 MB each.',
            },
            {
              q: 'How do I cancel my subscription?',
              a: 'Go to Settings → Billing and click "Manage billing." You can cancel from the Stripe customer portal at any time. You will retain access until the end of your billing period.',
            },
            {
              q: 'Is my data backed up?',
              a: 'Yes. We use Supabase managed PostgreSQL with daily automated backups. File uploads are stored in redundant object storage.',
            },
          ].map(item => (
            <div key={item.q} className="border-b border-gray-100 pb-4">
              <p className="font-medium text-gray-900 mb-1">{item.q}</p>
              <p className="text-sm text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Can&apos;t find what you need?{' '}
            <Link href="/help" className="text-blue-700 hover:underline">Browse the help center</Link> or{' '}
            <a href="mailto:support@crewcompliant.com" className="text-blue-700 hover:underline">email us</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
