'use client'

import { useState } from 'react'
import { CheckCircle2, CreditCard, ExternalLink, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PLANS, PlanId } from '@/lib/stripe'

interface Props {
  company: Record<string, string>
  role: string
  userId: string
}

export function BillingContent({ company, role, userId }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const isOwner = ['owner', 'admin'].includes(role)

  const status = company.subscription_status
  const currentPlan = company.subscription_plan
  const trialEnd = company.trial_ends_at ? new Date(company.trial_ends_at) : null
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : null
  const isTrialing = status === 'trialing'
  const isActive = status === 'active'

  async function handleSubscribe(planId: PlanId) {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod: billing,
          companyId: company.id,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to start checkout. Please try again.')
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handleManageBilling() {
    setLoadingPlan('portal')
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your plan and payment information.</p>
      </div>

      {/* Current status */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900">
                  {isTrialing ? 'Free Trial' : currentPlan ? PLANS[currentPlan as PlanId]?.name : 'No active plan'}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    isActive ? 'bg-green-50 text-green-700 border-green-200' :
                    isTrialing ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  )}
                >
                  {isActive ? 'Active' : isTrialing ? 'Trial' : status}
                </Badge>
              </div>
              {isTrialing && daysLeft !== null && (
                <p className="text-sm text-gray-600">
                  {daysLeft === 0 ? 'Trial expired — upgrade to continue.' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining in your free trial.`}
                </p>
              )}
              {isActive && currentPlan && (
                <p className="text-sm text-gray-600">
                  {PLANS[currentPlan as PlanId]?.description}
                </p>
              )}
            </div>
            {isOwner && isActive && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={loadingPlan === 'portal'}
                className="gap-2"
              >
                {loadingPlan === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Manage billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      {(!isActive || isTrialing) && isOwner && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose a plan</h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={cn('px-3 py-1 rounded-md text-sm font-medium transition-colors', billing === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={cn('px-3 py-1 rounded-md text-sm font-medium transition-colors', billing === 'annual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
              >
                Annual
                <span className="ml-1 text-xs text-green-600 font-medium">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([planId, plan]) => {
              const price = billing === 'monthly' ? plan.monthly_amount : plan.annual_amount
              const monthlyEquivalent = billing === 'annual' ? Math.round(plan.annual_amount / 12) : plan.monthly_amount
              const isRecommended = planId === 'growth'

              return (
                <Card key={planId} className={cn(
                  'relative',
                  isRecommended ? 'border-blue-500 border-2 shadow-md' : ''
                )}>
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-700 text-white">Most popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ${(monthlyEquivalent / 100).toFixed(0)}
                      </span>
                      <span className="text-gray-500 text-sm">/month</span>
                      {billing === 'annual' && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Billed ${(plan.annual_amount / 100).toFixed(0)}/year
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        'w-full',
                        isRecommended ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-900 hover:bg-gray-800'
                      )}
                      onClick={() => handleSubscribe(planId)}
                      disabled={!!loadingPlan}
                    >
                      {loadingPlan === planId ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      {isTrialing ? 'Start plan' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            All plans include a 14-day free trial. Cancel anytime. No setup fees. Payments processed securely by Stripe.
          </p>
        </>
      )}

      {/* Security note */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-700">Secure billing</p>
          <p className="text-xs text-gray-500">
            Your payment information is handled by Stripe. We never store your credit card number. You can cancel your subscription at any time from the billing portal.
          </p>
        </div>
      </div>
    </div>
  )
}
