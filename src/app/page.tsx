import Link from 'next/link'
import { CheckCircle2, Clock, FileWarning, Shield, Bell, BarChart3, ArrowRight, Star, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">CrewCompliant</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="#features" className="hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/help" className="hover:text-gray-900">Help</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
            Built for electrical contractors
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Stop losing jobs over{' '}
            <span className="text-blue-700">expired licenses</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            CrewCompliant tracks every license, insurance certificate, and safety certification for your crew. Get automatic alerts before anything expires — so you never get caught off guard on a job site.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-base px-8 h-12 w-full sm:w-auto">
                Start 14-day free trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto">
                See a live demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Sound familiar?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title: "Spreadsheets that get out of date",
                desc: "You built the compliance spreadsheet, but nobody updates it. You find out a license lapsed when the inspector shows up."
              },
              {
                icon: '⚠️',
                title: "Scrambling when GCs ask for COIs",
                desc: "A general contractor demands certificates of insurance for every sub on the job — and you're hunting through emails to find them."
              },
              {
                icon: '💸',
                title: "Work stoppages that cost you money",
                desc: "An expired journeyman license means your crew can't pull permits. Every day of delay costs real money and damages your reputation."
              }
            ].map((item, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to stay compliant</h2>
            <p className="text-gray-600 text-lg">Set it up once. Let CrewCompliant watch the deadlines for you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Bell className="w-5 h-5 text-blue-700" />,
                title: "Automatic expiration alerts",
                desc: "Get email reminders 60, 30, 14, and 7 days before anything expires. Never be surprised."
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                title: "Color-coded compliance dashboard",
                desc: "See your entire crew's compliance status at a glance. Green, yellow, and red — instantly clear."
              },
              {
                icon: <FileWarning className="w-5 h-5 text-orange-600" />,
                title: "Document request portal",
                desc: "Send a secure link to employees or subs asking them to upload their own documents. No login required for them."
              },
              {
                icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
                title: "Compliance reports",
                desc: "Download a clean PDF report showing everyone's status. Perfect for pre-job checklists or GC submissions."
              },
              {
                icon: <Clock className="w-5 h-5 text-blue-600" />,
                title: "License and certification tracking",
                desc: "Master, journeyman, and apprentice licenses. OSHA training. First aid. Vehicle inspections. All in one place."
              },
              {
                icon: <Lock className="w-5 h-5 text-gray-600" />,
                title: "Secure document storage",
                desc: "Documents are encrypted and stored securely. Only your team can access them. Private signed download links."
              }
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for small electrical contractors</h2>
          <p className="text-gray-600 text-lg mb-10">If you run a crew of 3 to 50 and deal with any of these, CrewCompliant is for you:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              'Master & journeyman licenses',
              'Workers\' comp certificates',
              'General liability insurance',
              'Subcontractor COIs',
              'OSHA 10/30 training',
              'First aid certifications',
              'Vehicle registrations',
              'State contractor licenses',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-16 px-4 sm:px-6 bg-blue-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Simple, affordable pricing</h2>
          <p className="text-blue-200 text-lg mb-8">
            Starting at $49/month for up to 10 people. No per-document fees. No setup charges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700 w-full sm:w-auto">
                View all plans
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
                Start free 14-day trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <p className="max-w-4xl mx-auto text-xs text-gray-400 text-center">
          CrewCompliant is an administrative tracking tool. It does not provide legal, compliance, or licensing advice. The compliance score and status indicators reflect document dates only — not actual legal standing. Always consult qualified professionals for regulatory requirements in your jurisdiction.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">CrewCompliant</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                Compliance tracking for electrical contractors who run tight operations.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-gray-900">Pricing</Link></li>
                  <li><Link href="/demo" className="hover:text-gray-900">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Help</h4>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href="/help" className="hover:text-gray-900">Help Center</Link></li>
                  <li><Link href="/help/getting-started" className="hover:text-gray-900">Getting Started</Link></li>
                  <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} CrewCompliant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
