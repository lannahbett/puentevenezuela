
-- 1) New report_contacts table (PII restricted from public reads)
CREATE TABLE public.report_contacts (
  report_id uuid PRIMARY KEY REFERENCES public.reports(id) ON DELETE CASCADE,
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.report_contacts TO anon, authenticated;
GRANT ALL ON public.report_contacts TO service_role;

ALTER TABLE public.report_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add contact info when creating a report"
ON public.report_contacts FOR INSERT
TO anon, authenticated
WITH CHECK (true);
-- No SELECT/UPDATE/DELETE policies: only service_role bypasses RLS.

-- Migrate existing contact data
INSERT INTO public.report_contacts (report_id, contact_name, contact_phone, contact_email, created_at)
SELECT id, contact_name, contact_phone, contact_email, created_at
FROM public.reports
WHERE contact_name IS NOT NULL OR contact_phone IS NOT NULL OR contact_email IS NOT NULL
ON CONFLICT (report_id) DO NOTHING;

-- Drop contact columns from public.reports
ALTER TABLE public.reports
  DROP COLUMN IF EXISTS contact_name,
  DROP COLUMN IF EXISTS contact_phone,
  DROP COLUMN IF EXISTS contact_email;

-- 2) Remove overly permissive anonymous UPDATE policy on reports
DROP POLICY IF EXISTS "Anonymous users can update reports" ON public.reports;

-- The protect_report_fields trigger referenced dropped columns; simplify it.
CREATE OR REPLACE FUNCTION public.protect_report_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  -- Anonymous UPDATEs are now blocked at the policy level.
  -- Signed-in users may only update rows they own (enforced by RLS).
  RETURN NEW;
END;
$$;

-- 3) Tighten storage.objects policies for the report-attachments bucket
DROP POLICY IF EXISTS "Public read of report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload report attachments" ON storage.objects;

CREATE POLICY "Read report attachments only when registered"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'report-attachments'
  AND EXISTS (
    SELECT 1 FROM public.report_attachments ra
    WHERE ra.storage_path = storage.objects.name
  )
);

CREATE POLICY "Upload report attachments only under a valid report id"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'report-attachments'
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id::text = split_part(storage.objects.name, '/', 1)
  )
);
