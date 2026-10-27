DROP POLICY IF EXISTS "Anonymous users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Anonymous users can create unowned reports" ON public.reports FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Signed-in users create own or unowned reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());