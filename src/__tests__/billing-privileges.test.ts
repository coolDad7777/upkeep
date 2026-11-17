import { readFileSync } from 'node:fs'
import path from 'node:path'

const sql = readFileSync(
  path.join(process.cwd(), 'supabase/migrations/004_protect_company_billing.sql'),
  'utf8',
)

const PROTECTED_COLUMNS = [
  'subscription_status',
  'subscription_plan',
  'stripe_customer_id',
  'stripe_subscription_id',
  'trial_ends_at',
  'is_suspended',
]

function grantColumns(statement: 'INSERT' | 'UPDATE'): string[] {
  const match = sql.match(
    new RegExp(`GRANT ${statement} \\(([\\s\\S]*?)\\)\\s*ON companies TO authenticated`),
  )
  if (!match) {
    throw new Error(`missing GRANT ${statement} for authenticated`)
  }

  return match[1]
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean)
}

describe('company billing columns stay off tenant grants', () => {
  it('revokes table-level insert and update from client roles', () => {
    expect(sql).toMatch(/REVOKE INSERT, UPDATE ON companies FROM PUBLIC, anon, authenticated/)
  })

  it('grants insert for profile fields including owner_id', () => {
    const columns = grantColumns('INSERT')
    expect(columns).toEqual(['name', 'industry', 'slug', 'owner_id', 'logo_url', 'settings'])
    expect(columns).toContain('owner_id')
  })

  it('grants update for profile fields and not owner_id', () => {
    const columns = grantColumns('UPDATE')
    expect(columns).toEqual(['name', 'industry', 'slug', 'logo_url', 'settings'])
    expect(columns).not.toContain('owner_id')
  })

  it('does not grant billing, stripe, trial, or suspension columns', () => {
    const insert = grantColumns('INSERT')
    const update = grantColumns('UPDATE')

    for (const column of PROTECTED_COLUMNS) {
      expect(insert).not.toContain(column)
      expect(update).not.toContain(column)
    }
  })
})
