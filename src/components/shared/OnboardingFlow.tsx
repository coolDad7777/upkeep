'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle2, ArrowRight, Loader2, Building2, Users, Bell } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'

const INDUSTRIES = [
  { value: 'electrical', label: 'Electrical Contractor' },
  { value: 'hvac', label: 'HVAC / Mechanical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'construction', label: 'General Construction' },
  { value: 'cleaning', label: 'Commercial Cleaning' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'other', label: 'Other Trades' },
]

interface Props {
  userId: string
  userEmail: string
  fullName: string
}

export function OnboardingFlow({ userId, userEmail, fullName }: Props) {
  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('electrical')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function createCompany() {
    if (!companyName.trim()) {
      setError('Company name is required.')
      return
    }

    setLoading(true)
    setError(null)

    const slug = slugify(companyName)

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName.trim(),
        industry,
        slug: `${slug}-${Date.now()}`,
        owner_id: userId,
      })
      .select('id')
      .single()

    if (companyError || !company) {
      setError(companyError?.message || 'Failed to create company.')
      setLoading(false)
      return
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('company_members')
      .insert({
        company_id: company.id,
        user_id: userId,
        role: 'owner',
      })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    // Update profile
    await supabase.from('user_profiles').upsert({
      id: userId,
      current_company_id: company.id,
      onboarding_completed: true,
    })

    setLoading(false)
    toast.success('Company created! Welcome to CrewCompliant.')
    router.push('/dashboard')
    router.refresh()
  }

  const steps = [
    { num: 1, title: 'Create company', icon: Building2 },
    { num: 2, title: 'Your industry', icon: Users },
    { num: 3, title: 'Ready to go', icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="h-16 border-b bg-white flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">CrewCompliant</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step > s.num ? 'bg-green-600 text-white' : step === s.num ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-sm hidden sm:block ${step === s.num ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 ${step > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <Card>
              <CardContent className="p-8">
                <Building2 className="w-10 h-10 text-blue-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">What's your company name?</h1>
                <p className="text-gray-500 mb-6">This will appear on your compliance reports and notifications.</p>

                {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company name *</Label>
                    <Input
                      id="company"
                      placeholder="Johnson Electrical Services LLC"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && setStep(2)}
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-blue-700 hover:bg-blue-800 gap-2"
                  onClick={() => {
                    if (companyName.trim()) setStep(2)
                    else setError('Company name is required.')
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardContent className="p-8">
                <Users className="w-10 h-10 text-blue-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">What industry are you in?</h1>
                <p className="text-gray-500 mb-6">We'll pre-load the most common document types for your industry.</p>

                <div className="space-y-3">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind.value}
                      onClick={() => setIndustry(ind.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        industry === ind.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{ind.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 bg-blue-700 hover:bg-blue-800 gap-2" onClick={() => setStep(3)}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardContent className="p-8">
                <CheckCircle2 className="w-10 h-10 text-green-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to set up {companyName}!</h1>
                <p className="text-gray-500 mb-6">Here's what happens next:</p>

                <div className="space-y-3 mb-8">
                  {[
                    { icon: '📋', text: `We'll pre-load standard document types for ${INDUSTRIES.find(i => i.value === industry)?.label || 'your industry'}` },
                    { icon: '👥', text: 'Add your crew members and subcontractors' },
                    { icon: '📄', text: 'Upload their licenses, insurance certificates, and certifications' },
                    { icon: '🔔', text: 'Set up automatic reminders before documents expire' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-gray-600 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>

                {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    className="flex-1 bg-blue-700 hover:bg-blue-800 gap-2"
                    onClick={createCompany}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create my company
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Your 14-day free trial starts now. No credit card required.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
