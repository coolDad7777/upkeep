import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — CrewCompliant',
  description: 'Terms and conditions for using CrewCompliant.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-700">CrewCompliant</Link>
          <Link href="/login" className="text-sm text-blue-700 font-medium hover:underline">Sign in</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 3, 2026</p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-amber-800">
            <strong>Administrative tool disclaimer:</strong> CrewCompliant is an administrative record-keeping
            tool only. It does not verify that licenses or certifications are valid, does not provide legal
            compliance advice, and does not guarantee that your business meets any regulatory requirement.
            Always consult a licensed attorney or relevant licensing authority for compliance questions.
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance</h2>
            <p className="text-sm leading-relaxed">
              By creating an account or using CrewCompliant, you agree to these Terms of Service.
              If you are accepting on behalf of a company, you represent that you have authority to bind
              that company to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of service</h2>
            <p className="text-sm leading-relaxed">
              CrewCompliant provides a subscription-based software tool that helps businesses track
              document expiration dates, send reminders, and manage compliance records. The Service is
              an administrative aid only and does not constitute legal, regulatory, or professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account responsibilities</h2>
            <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate information and keep it up to date.</li>
              <li>You may not share your account with others outside your organization.</li>
              <li>You must be at least 18 years old to use the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable use</h2>
            <p className="text-sm leading-relaxed mb-2">You agree not to:</p>
            <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
              <li>Upload files containing malware, viruses, or malicious code.</li>
              <li>Attempt to gain unauthorized access to other accounts or our systems.</li>
              <li>Use the Service to store or transmit illegal content.</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code.</li>
              <li>Use automated scraping tools against the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Billing and cancellation</h2>
            <p className="text-sm leading-relaxed">
              Subscriptions are billed monthly or annually in advance. You may cancel at any time from
              the billing page. Cancellation takes effect at the end of your current billing period.
              We do not offer refunds for unused time except where required by law or at our sole discretion.
              We may change pricing with 30 days&apos; notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Free trial</h2>
            <p className="text-sm leading-relaxed">
              New accounts receive a 14-day free trial. No credit card is required to start a trial.
              At the end of the trial, you must subscribe to continue using the Service. We may modify
              or discontinue free trials at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data ownership</h2>
            <p className="text-sm leading-relaxed">
              You own your data. We do not claim ownership of documents, records, or other content you upload.
              You grant us a limited license to store and process your data solely to provide the Service.
              You can export or request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimer of warranties</h2>
            <p className="text-sm leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT REMINDERS
              WILL BE DELIVERED ON TIME. CREWCOMPLIANT IS NOT A SUBSTITUTE FOR PROFESSIONAL LEGAL OR
              COMPLIANCE ADVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of liability</h2>
            <p className="text-sm leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CREWCOMPLIANT SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS OR DATA,
              ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU
              PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing law</h2>
            <p className="text-sm leading-relaxed">
              These terms are governed by the laws of the State of Texas, without regard to conflict of
              law principles. Any disputes shall be resolved in the courts of Travis County, Texas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes</h2>
            <p className="text-sm leading-relaxed">
              We may update these terms at any time. We will notify you by email and in-app notice at
              least 14 days before material changes take effect. Continued use after that period constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p className="text-sm leading-relaxed">
              Questions about these terms? Email{' '}
              <a href="mailto:legal@crewcompliant.com" className="text-blue-700 hover:underline">
                legal@crewcompliant.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          <Link href="/" className="hover:text-gray-900">Home</Link>
        </div>
      </main>
    </div>
  )
}
