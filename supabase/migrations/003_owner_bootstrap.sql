-- Signup calls insert().select(), which is INSERT ... RETURNING.
-- company_select only allowed existing members, so PostgreSQL rejects that
-- statement and the company is never created. members_insert also required
-- the creator to already be an admin, so the owner membership could not be
-- written even if the company row existed. Every new account stayed on
-- onboarding.

CREATE POLICY "company_select_owner" ON companies
  FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "members_insert_owner" ON company_members
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1
      FROM companies AS owned
      WHERE owned.id = company_id
        AND owned.owner_id = auth.uid()
    )
  );
