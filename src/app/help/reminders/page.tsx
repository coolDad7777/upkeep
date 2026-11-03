import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Reminders — CrewCompliant Help',
}

export default function RemindersHelpPage() {
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
        <p className="text-sm text-blue-700 font-medium mb-2">Reminders</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Email reminders for expiring documents</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">How reminders work</h2>
          <p>
            CrewCompliant checks your documents once per day and sends reminder emails based on how many
            days remain until each document expires. You choose which intervals trigger a reminder.
          </p>
          <p>
            Reminders go to the <strong>account owner</strong> of each company. They include the person&apos;s
            name, the document type, and the expiration date. No sensitive files are attached to reminder emails.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Default reminder schedule</h2>
          <p>When you create your account, reminders are sent at these intervals before expiration:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>60 days before</li>
            <li>30 days before</li>
            <li>14 days before</li>
            <li>7 days before</li>
            <li>On the expiration day</li>
          </ul>
          <p>After a document expires, you can also enable reminders at 7 and 30 days past due.</p>

          <h2 className="text-xl font-semibold text-gray-900">Changing your reminder schedule</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <strong>Settings</strong> from the main navigation.</li>
            <li>Scroll to <strong>Email reminder schedule</strong>.</li>
            <li>Toggle each interval on or off using the switches.</li>
            <li>Changes take effect on the next daily check (usually within 24 hours).</li>
          </ol>

          <h2 className="text-xl font-semibold text-gray-900">Why didn&apos;t I get a reminder?</h2>
          <p>Common reasons:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>The reminder interval isn&apos;t enabled</strong> — Check Settings → reminder schedule to make sure the relevant interval is toggled on.</li>
            <li><strong>The email landed in spam</strong> — Add support@crewcompliant.com to your contacts or whitelist our domain in your email settings.</li>
            <li><strong>No expiry date on the document</strong> — Reminders only fire for documents with an expiration date. Documents without dates are tracked but don&apos;t trigger reminders.</li>
            <li><strong>Duplicate prevention</strong> — We only send one reminder per document per interval. If a reminder was sent and the document was renewed, we won&apos;t resend for the old record.</li>
            <li><strong>Person is inactive</strong> — Reminders are not sent for deactivated people or vehicles.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">Reminder history</h2>
          <p>
            You can see every reminder email that has been sent from the <strong>Reminders</strong> page in
            the main navigation. It shows the date sent, the document, and the person it was for.
          </p>
          <p>
            The Reminders page also shows all documents expiring in the next 60 days so you can act
            proactively even without waiting for an email.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Billing plan and reminders</h2>
          <p>
            Email reminders are included in all paid plans (Starter, Growth, and Pro). They are not available
            during the 14-day free trial — subscribe to activate them.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/help/document-requests" className="text-sm text-blue-700 hover:underline">Requesting documents from your crew →</Link>
          <Link href="/help/billing" className="text-sm text-blue-700 hover:underline">Billing & subscription →</Link>
        </div>
      </article>
    </div>
  )
}
