-- ============================================================
-- CrewCompliant Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMPANIES (tenants)
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'electrical',
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status TEXT NOT NULL DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  subscription_plan TEXT CHECK (subscription_plan IN ('starter', 'growth', 'pro')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  logo_url TEXT,
  settings JSONB NOT NULL DEFAULT '{
    "timezone": "America/Chicago",
    "reminder_defaults": [60, 30, 14, 7],
    "require_expiry_date": false,
    "allow_document_requests": true
  }'::jsonb,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPANY MEMBERS
-- ============================================================
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff'
    CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- ============================================================
-- USER PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  current_company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PEOPLE (employees, subcontractors, vendors)
-- ============================================================
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'employee'
    CHECK (type IN ('employee', 'subcontractor', 'vendor')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  company_name TEXT, -- for subcontractors/vendors
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  plate TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENT TYPES
-- ============================================================
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL = system default
  name TEXT NOT NULL,
  description TEXT,
  applies_to TEXT[] NOT NULL DEFAULT ARRAY['person'],
  is_required BOOLEAN NOT NULL DEFAULT false,
  reminder_days INTEGER[] NOT NULL DEFAULT ARRAY[60, 30, 14, 7],
  is_system BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed system document types for electrical contractors
INSERT INTO document_types (name, description, applies_to, is_required, reminder_days, is_system, sort_order) VALUES
  ('Master Electrician License', 'State-issued master electrician license', ARRAY['person'], true, ARRAY[60,30,14,7], true, 1),
  ('Journeyman Electrician License', 'State-issued journeyman license', ARRAY['person'], true, ARRAY[60,30,14,7], true, 2),
  ('Apprentice Registration', 'Apprenticeship registration certificate', ARRAY['person'], false, ARRAY[60,30,14], true, 3),
  ('General Liability Insurance', 'Company general liability insurance certificate', ARRAY['company'], true, ARRAY[60,30,14,7], true, 4),
  ('Workers'' Compensation Insurance', 'Workers'' comp insurance certificate', ARRAY['person','company'], true, ARRAY[60,30,14,7], true, 5),
  ('Electrical Contractor License', 'State contractor license', ARRAY['company'], true, ARRAY[60,30,14,7], true, 6),
  ('OSHA 10 Certification', 'OSHA 10-hour safety training', ARRAY['person'], false, ARRAY[30,14,7], true, 7),
  ('OSHA 30 Certification', 'OSHA 30-hour safety training', ARRAY['person'], false, ARRAY[60,30,14], true, 8),
  ('First Aid / CPR Certification', 'First aid and CPR training', ARRAY['person'], false, ARRAY[30,14], true, 9),
  ('Vehicle Registration', 'Vehicle registration document', ARRAY['vehicle'], true, ARRAY[30,14,7], true, 10),
  ('Vehicle Insurance', 'Auto insurance certificate for company vehicle', ARRAY['vehicle'], true, ARRAY[60,30,14,7], true, 11),
  ('Vehicle Inspection', 'Annual vehicle safety inspection', ARRAY['vehicle'], false, ARRAY[30,14,7], true, 12),
  ('Subcontractor Agreement', 'Signed subcontractor agreement', ARRAY['person'], false, ARRAY[30,14], true, 13),
  ('Certificate of Insurance (COI)', 'Subcontractor COI naming your company as additional insured', ARRAY['person'], true, ARRAY[60,30,14,7], true, 14),
  ('Background Check', 'Employee background check result', ARRAY['person'], false, ARRAY[30], true, 15);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  -- file storage
  file_name TEXT,
  file_path TEXT, -- Supabase Storage path
  file_size INTEGER,
  file_type TEXT,
  -- dates
  issue_date DATE,
  expiry_date DATE,
  -- status
  status TEXT NOT NULL DEFAULT 'missing'
    CHECK (status IN ('active', 'expiring_soon', 'expired', 'missing', 'pending')),
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  version INTEGER NOT NULL DEFAULT 1,
  is_superseded BOOLEAN NOT NULL DEFAULT false, -- older versions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- at least one of person_id or vehicle_id must be set
  CONSTRAINT document_owner_required CHECK (
    person_id IS NOT NULL OR vehicle_id IS NOT NULL
  )
);

-- ============================================================
-- DOCUMENT REQUESTS (for requesting docs from employees/subs)
-- ============================================================
CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REMINDER LOGS (prevent duplicate reminders)
-- ============================================================
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_email TEXT NOT NULL,
  UNIQUE(document_id, days_before, recipient_email)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);
CREATE INDEX idx_people_company ON people(company_id);
CREATE INDEX idx_vehicles_company ON vehicles(company_id);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_person ON documents(person_id);
CREATE INDEX idx_documents_vehicle ON documents(vehicle_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_document_types_company ON document_types(company_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_reminder_logs_document ON reminder_logs(document_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of company
CREATE OR REPLACE FUNCTION is_company_member(company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = $1
    AND company_members.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: check if user has role
CREATE OR REPLACE FUNCTION has_company_role(company_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = $1
    AND company_members.user_id = auth.uid()
    AND (
      CASE required_role
        WHEN 'owner' THEN role = 'owner'
        WHEN 'admin' THEN role IN ('owner', 'admin')
        WHEN 'staff' THEN role IN ('owner', 'admin', 'staff')
        WHEN 'viewer' THEN role IN ('owner', 'admin', 'staff', 'viewer')
        ELSE false
      END
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Companies: members can view; owners/admins can update
CREATE POLICY "company_select" ON companies FOR SELECT USING (is_company_member(id));
CREATE POLICY "company_insert" ON companies FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "company_update" ON companies FOR UPDATE USING (has_company_role(id, 'admin'));

-- Company members
CREATE POLICY "members_select" ON company_members FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "members_insert" ON company_members FOR INSERT WITH CHECK (has_company_role(company_id, 'admin'));
CREATE POLICY "members_update" ON company_members FOR UPDATE USING (has_company_role(company_id, 'admin'));
CREATE POLICY "members_delete" ON company_members FOR DELETE USING (has_company_role(company_id, 'admin'));

-- User profiles
CREATE POLICY "profile_select_own" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profile_insert_own" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profile_update_own" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- People
CREATE POLICY "people_select" ON people FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "people_insert" ON people FOR INSERT WITH CHECK (has_company_role(company_id, 'staff'));
CREATE POLICY "people_update" ON people FOR UPDATE USING (has_company_role(company_id, 'staff'));
CREATE POLICY "people_delete" ON people FOR DELETE USING (has_company_role(company_id, 'admin'));

-- Vehicles
CREATE POLICY "vehicles_select" ON vehicles FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "vehicles_insert" ON vehicles FOR INSERT WITH CHECK (has_company_role(company_id, 'staff'));
CREATE POLICY "vehicles_update" ON vehicles FOR UPDATE USING (has_company_role(company_id, 'staff'));
CREATE POLICY "vehicles_delete" ON vehicles FOR DELETE USING (has_company_role(company_id, 'admin'));

-- Document types: everyone can see system types; members see company types
CREATE POLICY "doc_types_select" ON document_types FOR SELECT
  USING (company_id IS NULL OR is_company_member(company_id));
CREATE POLICY "doc_types_insert" ON document_types FOR INSERT
  WITH CHECK (has_company_role(company_id, 'admin'));
CREATE POLICY "doc_types_update" ON document_types FOR UPDATE
  USING (has_company_role(company_id, 'admin') AND NOT is_system);
CREATE POLICY "doc_types_delete" ON document_types FOR DELETE
  USING (has_company_role(company_id, 'admin') AND NOT is_system);

-- Documents
CREATE POLICY "documents_select" ON documents FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (has_company_role(company_id, 'staff'));
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (has_company_role(company_id, 'staff'));
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (has_company_role(company_id, 'admin'));

-- Document requests: company members can see
CREATE POLICY "doc_requests_select" ON document_requests FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "doc_requests_insert" ON document_requests FOR INSERT WITH CHECK (has_company_role(company_id, 'staff'));

-- Audit logs: members can see their company's logs
CREATE POLICY "audit_select" ON audit_logs FOR SELECT USING (is_company_member(company_id));

-- Reminder logs: staff can view
CREATE POLICY "reminder_logs_select" ON reminder_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_id AND is_company_member(d.company_id)
  ));

-- Support tickets
CREATE POLICY "support_select" ON support_tickets FOR SELECT
  USING (user_id = auth.uid() OR is_company_member(company_id));
CREATE POLICY "support_insert" ON support_tickets FOR INSERT WITH CHECK (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER people_updated_at BEFORE UPDATE ON people FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update document status based on expiry
CREATE OR REPLACE FUNCTION refresh_document_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.file_path IS NULL THEN
    NEW.status = 'missing';
  ELSIF NEW.expiry_date IS NULL THEN
    NEW.status = 'active';
  ELSIF NEW.expiry_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status = 'expiring_soon';
  ELSE
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_status_refresh
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION refresh_document_status();
