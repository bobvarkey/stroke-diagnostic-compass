
-- Helper: can current user access this patient?
CREATE OR REPLACE FUNCTION public.can_access_patient(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = _patient_id
      AND (p.created_by = auth.uid()
           OR p.last_edited_by = auth.uid()
           OR public.has_role(auth.uid(), 'admin'))
  )
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_patient(uuid) FROM anon, authenticated;

-- Replace realtime.messages policies with scoped versions
DROP POLICY IF EXISTS "Authenticated users can read own realtime topics" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can publish realtime presence" ON realtime.messages;

CREATE POLICY "Scoped realtime read access"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (
    realtime.topic() LIKE 'patients:%'
    AND public.can_access_patient(
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
    )
  )
  OR (
    realtime.topic() LIKE 'patient_presence:%'
    AND public.can_access_patient(
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
    )
  )
  OR realtime.topic() = ('user_feedback:' || (auth.uid())::text)
);

CREATE POLICY "Scoped realtime publish access"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (
    realtime.topic() LIKE 'patients:%'
    AND public.can_access_patient(
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
    )
  )
  OR (
    realtime.topic() LIKE 'patient_presence:%'
    AND public.can_access_patient(
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
    )
  )
  OR realtime.topic() = ('user_feedback:' || (auth.uid())::text)
);
