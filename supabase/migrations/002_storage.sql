-- ============================================================
-- Supabase Storage Setup
-- ============================================================

-- Create documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access documents from their company
CREATE POLICY "documents_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "documents_download" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "documents_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM company_members cm
      JOIN company_members cm2 ON cm2.company_id = cm.company_id
        AND cm2.user_id = auth.uid()
        AND cm2.role IN ('owner', 'admin')
    )
  );
