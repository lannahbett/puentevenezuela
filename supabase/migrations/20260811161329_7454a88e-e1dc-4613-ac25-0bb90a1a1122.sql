CREATE TYPE public.report_country AS ENUM ('VE', 'CO');

ALTER TABLE public.reports
  ADD COLUMN country public.report_country NOT NULL DEFAULT 'VE';

UPDATE public.reports SET country = 'VE' WHERE country IS NULL;

CREATE TABLE public.report_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  label text NOT NULL,
  quantity_needed integer NOT NULL DEFAULT 1,
  quantity_fulfilled integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.report_items TO anon, authenticated;
GRANT ALL ON public.report_items TO service_role;

ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view report items"
  ON public.report_items FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can add report items"
  ON public.report_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TRIGGER update_report_items_updated_at
  BEFORE UPDATE ON public.report_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  message text NOT NULL,
  author_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.report_updates TO anon, authenticated;
GRANT ALL ON public.report_updates TO service_role;

ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view report updates"
  ON public.report_updates FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can add report updates"
  ON public.report_updates FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_report_items_report_id ON public.report_items(report_id);
CREATE INDEX idx_report_updates_report_id ON public.report_updates(report_id);
CREATE INDEX idx_reports_country ON public.reports(country);