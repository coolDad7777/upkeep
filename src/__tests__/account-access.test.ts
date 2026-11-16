import {
  decideAccountAccess,
  getAccountBlockReason,
  isListedPlatformAdmin,
  shouldGrantCheckoutTrial,
} from '@/lib/account-access'

const NOW = new Date('2026-11-16T12:00:00.000Z')

describe('getAccountBlockReason', () => {
  it('allows an active subscription and a trial that has not ended', () => {
    expect(getAccountBlockReason({ subscription_status: 'active', trial_ends_at: '2020-01-01T00:00:00.000Z' }, NOW)).toBeNull()
    expect(getAccountBlockReason({
      subscription_status: 'trialing',
      trial_ends_at: '2026-11-20T00:00:00.000Z',
    }, NOW)).toBeNull()
    expect(getAccountBlockReason({ subscription_status: 'past_due' }, NOW)).toBeNull()
    expect(getAccountBlockReason(null, NOW)).toBeNull()
  })

  it('blocks canceled, paused, suspended, and expired trials', () => {
    expect(getAccountBlockReason({ subscription_status: 'canceled' }, NOW)).toBe('subscription_inactive')
    expect(getAccountBlockReason({ subscription_status: 'paused' }, NOW)).toBe('subscription_inactive')
    expect(getAccountBlockReason({
      subscription_status: 'trialing',
      trial_ends_at: '2026-11-16T12:00:00.000Z',
    }, NOW)).toBe('trial_expired')
    expect(getAccountBlockReason({
      subscription_status: 'trialing',
      trial_ends_at: '2026-11-01T00:00:00.000Z',
    }, NOW)).toBe('trial_expired')
    expect(getAccountBlockReason({
      subscription_status: 'active',
      is_suspended: true,
    }, NOW)).toBe('suspended')
  })

  it('does not treat an unparseable trial end as expired', () => {
    expect(getAccountBlockReason({
      subscription_status: 'trialing',
      trial_ends_at: 'not-a-date',
    }, NOW)).toBeNull()
  })
})

describe('decideAccountAccess', () => {
  it('sends expired trials to billing but still allows checkout', () => {
    expect(decideAccountAccess('/dashboard', 'trial_expired')).toBe('redirect_billing')
    expect(decideAccountAccess('/api/documents/123/download', 'subscription_inactive')).toBe('api_denied')
    expect(decideAccountAccess('/billing', 'trial_expired')).toBe('allow')
    expect(decideAccountAccess('/api/billing/checkout', 'subscription_inactive')).toBe('allow')
    expect(decideAccountAccess('/api/billing/portal', 'subscription_inactive')).toBe('allow')
  })

  it('does not let a suspended company start checkout', () => {
    expect(decideAccountAccess('/billing', 'suspended')).toBe('allow')
    expect(decideAccountAccess('/api/billing/checkout', 'suspended')).toBe('api_denied')
    expect(decideAccountAccess('/dashboard', 'suspended')).toBe('redirect_billing')
  })

  it('does not treat nearby paths as billing', () => {
    expect(decideAccountAccess('/billing-extra', 'trial_expired')).toBe('redirect_billing')
    expect(decideAccountAccess('/api/billing-extra', 'trial_expired')).toBe('api_denied')
  })

  it('allows any path when the account is not blocked', () => {
    expect(decideAccountAccess('/dashboard', null)).toBe('allow')
  })
})

describe('shouldGrantCheckoutTrial', () => {
  it('grants a trial only while the first app trial is still open', () => {
    expect(shouldGrantCheckoutTrial({
      subscription_status: 'trialing',
      trial_ends_at: '2026-11-20T00:00:00.000Z',
      stripe_subscription_id: null,
    }, NOW)).toBe(true)
  })

  it('does not grant another trial after expiry, cancel, or an existing subscription', () => {
    expect(shouldGrantCheckoutTrial({
      subscription_status: 'trialing',
      trial_ends_at: '2026-11-01T00:00:00.000Z',
    }, NOW)).toBe(false)
    expect(shouldGrantCheckoutTrial({
      subscription_status: 'canceled',
      trial_ends_at: '2026-11-20T00:00:00.000Z',
    }, NOW)).toBe(false)
    expect(shouldGrantCheckoutTrial({
      subscription_status: 'trialing',
      trial_ends_at: '2026-11-20T00:00:00.000Z',
      stripe_subscription_id: 'sub_123',
    }, NOW)).toBe(false)
    expect(shouldGrantCheckoutTrial(null, NOW)).toBe(false)
  })
})

describe('isListedPlatformAdmin', () => {
  it('fails closed when the allow-list is empty', () => {
    expect(isListedPlatformAdmin(undefined, 'owner@example.com')).toBe(false)
    expect(isListedPlatformAdmin('', 'owner@example.com')).toBe(false)
    expect(isListedPlatformAdmin('  , ', 'owner@example.com')).toBe(false)
  })

  it('matches only listed emails', () => {
    expect(isListedPlatformAdmin('owner@example.com, ops@example.com', 'ops@example.com')).toBe(true)
    expect(isListedPlatformAdmin('owner@example.com', 'other@example.com')).toBe(false)
  })
})
