CREATE TYPE public.report_type AS ENUM ('need', 'offer');
CREATE TYPE public.report_category AS ENUM ('water', 'food', 'shelter', 'medicine', 'rescue', 'volunteer', 'transport', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'in_progress', 'resolved');

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.report_type NOT NULL,
  category public.report_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  urgency INTEGER NOT NULL DEFAULT 3 CHECK (urgency >= 1 AND urgency <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own reports" ON public.reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();