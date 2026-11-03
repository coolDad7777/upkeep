import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  starter: {
    name: 'Starter',
    description: 'Perfect for small crews up to 10 people',
    maxPeople: 10,
    price_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    price_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
    monthly_amount: 4900, // $49
    annual_amount: 46800, // $468 ($39/mo)
    features: [
      'Up to 10 people tracked',
      'Unlimited documents',
      'Email reminders',
      'Document requests',
      'Compliance dashboard',
      'CSV export',
    ],
  },
  growth: {
    name: 'Growth',
    description: 'For growing crews with 11–50 people',
    maxPeople: 50,
    price_monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY!,
    price_annual: process.env.STRIPE_PRICE_GROWTH_ANNUAL!,
    monthly_amount: 9900, // $99
    annual_amount: 95040, // $7,920/yr ($79.20/mo)
    features: [
      'Up to 50 people tracked',
      'Unlimited documents',
      'Email reminders',
      'Document requests',
      'Compliance dashboard',
      'PDF reports',
      'CSV export',
      'Priority email support',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For larger operations with 51–200 people',
    maxPeople: 200,
    price_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    price_annual: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    monthly_amount: 19900, // $199
    annual_amount: 190800, // $15,900/yr
    features: [
      'Up to 200 people tracked',
      'Unlimited documents',
      'Email reminders',
      'Document requests',
      'Compliance dashboard',
      'PDF reports',
      'CSV export',
      'Custom document types',
      'Priority support',
    ],
  },
} as const

export type PlanId = keyof typeof PLANS
