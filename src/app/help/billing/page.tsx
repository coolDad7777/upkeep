import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing & Subscription — CrewCompliant Help',
}

export default function BillingHelpPage() {
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
        <p className="text-sm text-blue-700 font-medium mb-2">Billing</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Billing and subscription</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-900">Plan</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-900">Price</th>
                  <th className="text-left py-2 font-medium text-gray-900">People limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 pr-4 font-medium">Starter</td>
                  <td className="py-2 pr-4">$49/mo</td>
                  <td className="py-2">Up to 10 people</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Growth</td>
                  <td className="py-2 pr-4">$99/mo</td>
                  <td className="py-2">Up to 50 people</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Pro</td>
                  <td className="py-2 pr-4">$199/mo</td>
                  <td className="py-2">Up to 200 people</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Annual billing saves 20%. All plans include all features.</p>

          <h2 className="text-xl font-semibold text-gray-900">Free trial</h2>
          <p>
            All new accounts get a <strong>14-day free trial</strong>. No credit card required.
            At the end of the trial, you&apos;ll need to choose a plan to continue. Your data is preserved
            whether or not you subscribe.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">How to subscribe</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <strong>Settings → Billing</strong> from the sidebar.</li>
            <li>Choose a plan (Starter, Growth, or Pro).</li>
            <li>Click <strong>Start plan</strong>.</li>
            <li>Enter your payment details in the Stripe checkout page.</li>
            <li>Your subscription activates immediately.</li>
          </ol>

          <h2 className="text-xl font-semibold text-gray-900">How to cancel</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <strong>Settings → Billing</strong>.</li>
            <li>Click <strong>Manage billing</strong>.</li>
            <li>In the Stripe customer portal, click <strong>Cancel plan</strong>.</li>
            <li>You retain access until the end of your current billing period.</li>
          </ol>
          <p>
            We don&apos;t offer refunds for unused time, but you can cancel at any time and won&apos;t
            be charged again.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Changing your plan</h2>
          <p>
            You can upgrade or downgrade at any time from Settings → Billing → Manage billing.
            Upgrades take effect immediately (prorated). Downgrades take effect at the start of your next
            billing period.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Payment failures</h2>
          <p>
            If your payment fails, we&apos;ll email you and retry a few times. If payment is not resolved
            within 7 days, your account will be paused. You can reactivate by updating your payment method
            in the billing portal.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Updating payment info</h2>
          <p>
            Go to Settings → Billing → Manage billing. In the Stripe portal, click
            <strong>Update payment method</strong> to change your card.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/pricing" className="text-sm text-blue-700 hover:underline">View pricing page →</Link>
          <Link href="/contact" className="text-sm text-blue-700 hover:underline">Contact support →</Link>
        </div>
      </article>
    </div>
  )
}
