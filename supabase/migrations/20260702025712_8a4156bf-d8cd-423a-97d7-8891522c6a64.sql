
CREATE OR REPLACE FUNCTION public.can_access_patient(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.patients WHERE id = _patient_id)
$$;

GRANT EXECUTE ON FUNCTION public.can_access_patient(uuid) TO authenticated;
