GRANT INSERT ON public.reports TO anon;
CREATE POLICY "Anonymous users can create reports" ON public.reports FOR INSERT TO anon WITH CHECK (true);