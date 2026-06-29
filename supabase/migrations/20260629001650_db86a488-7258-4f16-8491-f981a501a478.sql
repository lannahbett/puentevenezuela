
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS assigned_to_name text,
  ADD COLUMN IF NOT EXISTS assigned_to_contact text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- Allow anonymous updates of status/assignment (emergency context, no login required)
DROP POLICY IF EXISTS "Anonymous users can update reports" ON public.reports;
CREATE POLICY "Anonymous users can update reports"
  ON public.reports FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

GRANT UPDATE ON public.reports TO anon;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
