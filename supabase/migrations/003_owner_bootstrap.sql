-- Signup calls insert().select(), which is INSERT ... RETURNING.
-- company_select only allowed existing members, so the new owner could not
-- read the row they just created and onboarding aborted. members_insert also
-- required the creator to already be an admin, so the owner membership could
-- not be written even if the company row existed. Every new account stayed
-- off the dashboard.

CREATE POLICY "company_select_owner" ON public.companies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "members_insert_owner" ON public.company_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1
      FROM public.companies AS owned
      WHERE owned.id = company_id
        AND owned.owner_id = auth.uid()
    )
  );
