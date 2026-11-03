import Link from 'next/link'
import { CheckCircle2, Shield, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Pricing — CrewCompliant',
  description: 'Simple, affordable pricing for electrical contractor compliance tracking. Starting at $49/month.',
}

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    annualPrice: 39,
    description: 'Perfect for small crews up to 10 people',
    features: [
      'Up to 10 people tracked',
      'Unlimited document storage (10GB)',
      'Email expiration reminders',
      'Document request portal',
      'Compliance dashboard',
      'CSV export',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: 99,
    annualPrice: 79,
    description: 'For growing crews with 11–50 people',
    features: [
      'Up to 50 people tracked',
      'Unlimited document storage',
      'Email expiration reminders',
      'Document request portal',
      'Compliance dashboard',
      'PDF & CSV reports',
      'Custom document types',
      'Priority email support',
    ],
    cta: 'Start free trial',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Pro',
    price: 199,
    annualPrice: 159,
    description: 'For larger operations with 51–200 people',
    features: [
      'Up to 200 people tracked',
      'Unlimited document storage',
      'Email expiration reminders',
      'Document request portal',
      'Compliance dashboard',
      'PDF & CSV reports',
      'Custom document types',
      'Priority support',
      'Dedicated onboarding call',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
]

const FAQ = [
  {
    q: 'Is there a free trial?',
    a: "Yes — every plan starts with a 14-day free trial. No credit card required to start.",
  },
  {
    q: 'What happens after my trial ends?',
    a: "You'll be prompted to choose a plan. Your data is safe while your account is in trial. If you don't subscribe, we retain your data for 30 days before deletion.",
  },
  {
    q: 'Can I cancel at any time?',
    a: "Yes. Cancel anytime from your billing settings. No cancellation fee. You'll keep access until the end of your current billing period.",
  },
  {
    q: 'What counts as a "person"?',
    a: "Employees, subcontractors, and vendors each count as one person. Vehicles are tracked separately and don't count toward your person limit.",
  },
  {
    q: 'Do you store my actual documents?',
    a: "Yes — uploaded documents are stored securely in encrypted cloud storage. Access is controlled by your account. We use signed URLs for all downloads.",
  },
  {
    q: 'Does CrewCompliant certify legal compliance?',
    a: "No. CrewCompliant is an administrative tracking tool. It tracks expiration dates and helps you stay organized. It does not provide legal advice or certify regulatory compliance.",
  },
  {
    q: 'Can I switch plans?',
    a: "Yes. Upgrade or downgrade at any time. Prorated credits apply when upgrading.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">CrewCompliant</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/signup"><Button size="sm" className="bg-blue-700 hover:bg-blue-800">Start free trial</Button></Link>
          </div>
        </div>
      </nav>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-xl text-gray-600">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <Card key={plan.name} className={plan.highlighted ? 'border-blue-500 border-2 shadow-lg relative' : 'border shadow-sm'}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-700 text-white">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                  <p className="text-xs text-green-600 mt-0.5">Or ${plan.annualPrice}/mo billed annually (save 20%)</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className={`w-full ${plan.highlighted ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-900 hover:bg-gray-800'}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-200 rounded-lg p-4 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} CrewCompliant · <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}
