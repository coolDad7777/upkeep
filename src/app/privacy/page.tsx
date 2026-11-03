import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — CrewCompliant',
  description: 'How CrewCompliant collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">CrewCompliant</Link>
          <Link href="/login" className="text-sm text-blue-700 font-medium hover:underline">Sign in</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 3, 2026</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p className="text-sm leading-relaxed">
              CrewCompliant (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides a document expiration tracking tool for small
              service businesses. This policy explains how we collect and use information when you use our website
              and application at crewcompliant.com (the &quot;Service&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information we collect</h2>
            <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Account information:</strong> email address, company name, and password (hashed, never stored in plain text).</li>
              <li><strong>People and vehicle records:</strong> names, contact details, and notes you enter for your crew and fleet.</li>
              <li><strong>Documents:</strong> files you upload (licenses, certificates, insurance cards) and the associated metadata (dates, document types).</li>
              <li><strong>Usage data:</strong> log data, IP addresses, browser type, pages visited, and actions taken inside the app, used to diagnose issues and improve the product.</li>
              <li><strong>Payment information:</strong> processed exclusively by Stripe. We never see or store full card numbers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How we use your information</h2>
            <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
              <li>Provide, operate, and improve the Service.</li>
              <li>Send expiration reminder emails that you configure.</li>
              <li>Process subscription payments.</li>
              <li>Respond to support requests.</li>
              <li>Detect and prevent fraud and abuse.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              We do not sell, rent, or share your data with third parties for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data storage and security</h2>
            <p className="text-sm leading-relaxed">
              Data is stored in Supabase (PostgreSQL, hosted on AWS). Document files are stored in Supabase
              Storage (private bucket with row-level security). All data is encrypted at rest and in transit
              (TLS 1.2+). We use row-level security policies to ensure each company can only access its own data.
              Signed download URLs expire after 5 minutes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data retention</h2>
            <p className="text-sm leading-relaxed">
              We retain your data for as long as your account is active. If you cancel your subscription and
              do not log in for 90 days, your data may be scheduled for deletion. You can request immediate
              deletion by emailing support@crewcompliant.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Third-party services</h2>
            <p className="text-sm leading-relaxed">We use the following third-party services:</p>
            <ul className="text-sm space-y-1 list-disc list-inside mt-2 leading-relaxed">
              <li><strong>Supabase</strong> — database and file storage</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Render</strong> — application hosting</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Each service has its own privacy policy. We share only the minimum data necessary for each service to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your rights</h2>
            <p className="text-sm leading-relaxed">
              You can access, correct, or delete your personal data at any time by contacting us at
              support@crewcompliant.com. If you are in the EU or UK, you have additional rights under
              GDPR including the right to data portability and the right to restrict processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-sm leading-relaxed">
              We use session cookies required for authentication (set by Supabase Auth) and no
              third-party tracking cookies. We do not use Google Analytics or any advertising pixels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to this policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this policy from time to time. Material changes will be communicated by email
              and a notice inside the app at least 7 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p className="text-sm leading-relaxed">
              Questions? Email us at{' '}
              <a href="mailto:privacy@crewcompliant.com" className="text-blue-700 hover:underline">
                privacy@crewcompliant.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
          <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          <Link href="/" className="hover:text-gray-900">Home</Link>
        </div>
      </main>
    </div>
  )
}
