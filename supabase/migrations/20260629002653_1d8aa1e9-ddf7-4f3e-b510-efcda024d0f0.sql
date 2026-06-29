
CREATE TABLE public.report_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.report_attachments TO anon;
GRANT SELECT, INSERT, DELETE ON public.report_attachments TO authenticated;
GRANT INSERT ON public.report_attachments TO anon;
GRANT ALL ON public.report_attachments TO service_role;

ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments"
  ON public.report_attachments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can add attachments"
  ON public.report_attachments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX idx_report_attachments_report_id ON public.report_attachments(report_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.report_attachments;
