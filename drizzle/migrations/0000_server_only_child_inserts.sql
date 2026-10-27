DROP POLICY IF EXISTS "Anyone can add contact info when creating a report" ON public.report_contacts;
DROP POLICY IF EXISTS "Anyone can add report items" ON public.report_items;
DROP POLICY IF EXISTS "Anyone can add report updates" ON public.report_updates;
GRANT ALL ON public.report_contacts, public.report_items, public.report_updates TO service_role;