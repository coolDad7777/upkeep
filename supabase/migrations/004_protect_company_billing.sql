-- Tenant admins could update every column on their company, including
-- subscription_status, trial_ends_at, is_suspended, and the Stripe ids.
-- A suspended or canceled company could restore itself from the browser
-- with the public anon key. Table-level UPDATE includes every column, so
-- a column-level REVOKE would not stick. Replace it with an explicit list.
-- Stripe webhooks and the platform suspend route use the service role,
-- which keeps full access.

REVOKE INSERT, UPDATE ON companies FROM PUBLIC, anon, authenticated;

GRANT INSERT (
  name,
  industry,
  slug,
  owner_id,
  logo_url,
  settings
) ON companies TO authenticated;

GRANT UPDATE (
  name,
  industry,
  slug,
  logo_url,
  settings
) ON companies TO authenticated;
