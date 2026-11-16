export type AccountBlockReason = 'suspended' | 'subscription_inactive' | 'trial_expired'

export type CompanyAccess = {
  subscription_status?: string | null
  trial_ends_at?: string | null
  is_suspended?: boolean | null
}

/**
 * Why this company may not use the product right now.
 * Active and past_due subscriptions stay allowed. A trialing company is
 * allowed until trial_ends_at. Missing company data is allowed so a lookup
 * failure does not lock every account out.
 */
export function getAccountBlockReason(
  company: CompanyAccess | null | undefined,
  now = new Date(),
): AccountBlockReason | null {
  if (!company) return null
  if (company.is_suspended) return 'suspended'

  const status = company.subscription_status
  if (status === 'canceled' || status === 'paused') return 'subscription_inactive'

  if (status === 'trialing' && company.trial_ends_at) {
    const ends = new Date(company.trial_ends_at)
    if (!Number.isNaN(ends.getTime()) && ends.getTime() <= now.getTime()) {
      return 'trial_expired'
    }
  }

  return null
}

/** Billing pages and APIs a canceled or expired-trial company can still open. */
export function isBillingPath(pathname: string): boolean {
  return pathname === '/billing'
    || pathname.startsWith('/billing/')
    || pathname === '/api/billing'
    || pathname.startsWith('/api/billing/')
}

export type BlockDecision = 'allow' | 'redirect_billing' | 'api_denied'

/**
 * Suspended companies can open the billing page (so the block is explained)
 * but not checkout. Canceled, paused, and expired-trial companies can open
 * billing and the billing APIs so they can subscribe again.
 */
export function decideAccountAccess(
  pathname: string,
  reason: AccountBlockReason | null,
): BlockDecision {
  if (!reason) return 'allow'

  if (reason === 'suspended') {
    if (pathname === '/billing' || pathname.startsWith('/billing/')) return 'allow'
    return pathname.startsWith('/api/') ? 'api_denied' : 'redirect_billing'
  }

  if (isBillingPath(pathname)) return 'allow'
  return pathname.startsWith('/api/') ? 'api_denied' : 'redirect_billing'
}

/**
 * Checkout always used to attach a new 14-day Stripe trial. After the app
 * trial ends, that second trial restored access without payment. Only a
 * company still inside its first trial, with no Stripe subscription yet,
 * gets the introductory trial.
 */
export function shouldGrantCheckoutTrial(
  company: {
    stripe_subscription_id?: string | null
    subscription_status?: string | null
    trial_ends_at?: string | null
  } | null | undefined,
  now = new Date(),
): boolean {
  if (!company) return false
  if (company.stripe_subscription_id) return false
  if (company.subscription_status !== 'trialing') return false
  if (!company.trial_ends_at) return false

  const ends = new Date(company.trial_ends_at)
  if (Number.isNaN(ends.getTime())) return false
  return ends.getTime() > now.getTime()
}

/**
 * Platform-admin bypass for the access gate. An empty allow-list must not
 * match every user — that would disable the gate whenever ADMIN_EMAILS is unset.
 */
export function isListedPlatformAdmin(
  adminEmailsEnv: string | undefined,
  email: string | null | undefined,
): boolean {
  if (!email) return false
  const allowed = (adminEmailsEnv ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return allowed.length > 0 && allowed.includes(email)
}
