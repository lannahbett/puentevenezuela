
CREATE OR REPLACE FUNCTION public.protect_report_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only restrict for unauthenticated users
  IF auth.uid() IS NULL THEN
    IF NEW.type IS DISTINCT FROM OLD.type
       OR NEW.category IS DISTINCT FROM OLD.category
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.latitude IS DISTINCT FROM OLD.latitude
       OR NEW.longitude IS DISTINCT FROM OLD.longitude
       OR NEW.location_name IS DISTINCT FROM OLD.location_name
       OR NEW.contact_name IS DISTINCT FROM OLD.contact_name
       OR NEW.contact_phone IS DISTINCT FROM OLD.contact_phone
       OR NEW.contact_email IS DISTINCT FROM OLD.contact_email
       OR NEW.urgency IS DISTINCT FROM OLD.urgency
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Anonymous users can only update status and assignment fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_report_fields_trigger ON public.reports;
CREATE TRIGGER protect_report_fields_trigger
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_report_fields();
