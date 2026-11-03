import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import Stripe from 'stripe'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  async function getCompanyIdFromCustomer(customerId: string): Promise<string | null> {
    const { data } = await supabase
      .from('companies')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()
    return data?.id || null
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const companyId = session.metadata?.company_id
      const planId = session.metadata?.plan_id
      const subscriptionId = session.subscription as string

      if (!companyId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      await supabase.from('companies').update({
        stripe_subscription_id: subscriptionId,
        subscription_status: subscription.status,
        subscription_plan: planId,
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      }).eq('id', companyId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const companyId = await getCompanyIdFromCustomer(subscription.customer as string)
      if (!companyId) break

      const planId = subscription.metadata?.plan_id
        || (subscription.items.data[0]?.price as Stripe.Price)?.metadata?.plan_id

      await supabase.from('companies').update({
        subscription_status: subscription.status,
        subscription_plan: planId || null,
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      }).eq('id', companyId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const companyId = await getCompanyIdFromCustomer(subscription.customer as string)
      if (!companyId) break

      await supabase.from('companies').update({
        subscription_status: 'canceled',
        subscription_plan: null,
      }).eq('id', companyId)

      // Get company email
      const { data: company } = await supabase
        .from('companies')
        .select('name, owner_id')
        .eq('id', companyId)
        .single()

      if (company) {
        const { data: owner } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', company.owner_id)
          .single()

        if (owner && process.env.RESEND_API_KEY) {
          const { data: userData } = await supabase.auth.admin.getUserById(company.owner_id)
          if (userData.user?.email) {
            await resend.emails.send({
              from: 'CrewCompliant <noreply@crewcompliant.com>',
              to: userData.user.email,
              subject: 'Your CrewCompliant subscription has been canceled',
              html: `
                <p>Hi,</p>
                <p>Your CrewCompliant subscription for ${company.name} has been canceled.</p>
                <p>You can resubscribe at any time from your billing page. Your data will be retained for 30 days.</p>
                <p>If you have feedback about why you canceled, please reply to this email — we read every response.</p>
              `,
            }).catch(console.error)
          }
        }
      }

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const companyId = await getCompanyIdFromCustomer(invoice.customer as string)
      if (!companyId) break

      await supabase.from('companies').update({
        subscription_status: 'past_due',
      }).eq('id', companyId)

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const companyId = await getCompanyIdFromCustomer(invoice.customer as string)
      if (!companyId) break

      await supabase.from('companies').update({
        subscription_status: 'active',
      }).eq('id', companyId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
