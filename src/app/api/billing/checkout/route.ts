import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe, PLANS, PlanId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { planId, billingPeriod, companyId } = body

  if (!planId || !billingPeriod || !companyId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const plan = PLANS[planId as PlanId]
  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Verify ownership
  const { data: membership } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('name, stripe_customer_id')
    .eq('id', companyId)
    .single()

  const priceId = billingPeriod === 'annual' ? plan.price_annual : plan.price_monthly

  if (!priceId) {
    return NextResponse.json({ error: 'Billing not configured. Contact support.' }, { status: 400 })
  }

  let customerId = company?.stripe_customer_id

  // Create Stripe customer if doesn't exist
  if (!customerId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name || company?.name || undefined,
      metadata: {
        company_id: companyId,
        user_id: user.id,
      },
    })
    customerId = customer.id

    // stripe_customer_id is not writable by the signed-in user. The membership
    // check above already proved the caller is an owner or admin of companyId.
    const serviceSupabase = await createServiceClient()
    const { error: saveBillingError } = await serviceSupabase
      .from('companies')
      .update({ stripe_customer_id: customerId })
      .eq('id', companyId)

    if (saveBillingError) {
      return NextResponse.json({ error: 'Failed to save billing account' }, { status: 500 })
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/billing`,
    subscription_data: {
      metadata: {
        company_id: companyId,
        plan_id: planId,
      },
      trial_period_days: 14,
    },
    allow_promotion_codes: true,
    metadata: {
      company_id: companyId,
      plan_id: planId,
    },
  })

  return NextResponse.json({ url: session.url })
}
