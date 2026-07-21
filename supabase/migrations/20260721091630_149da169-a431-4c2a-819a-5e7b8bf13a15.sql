-- 1. Fix can_access_patient to check real ownership
CREATE OR REPLACE FUNCTION public.can_access_patient(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = _patient_id
      AND (
        p.created_by = auth.uid()
        OR p.last_edited_by = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
  )
$$;

-- 2. Restrict patient_presence SELECT
DROP POLICY IF EXISTS "Authenticated users can view presence" ON public.patient_presence;
CREATE POLICY "Users can view presence for accessible patients"
ON public.patient_presence
FOR SELECT
TO authenticated
USING (public.can_access_patient(patient_id));

-- 3. Restrict profiles SELECT to own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));