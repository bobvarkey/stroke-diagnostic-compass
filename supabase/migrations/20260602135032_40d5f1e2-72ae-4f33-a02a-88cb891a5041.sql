
-- 1. Restrict stroke_call_logs SELECT to admins
DROP POLICY IF EXISTS "Authenticated users can view call logs" ON public.stroke_call_logs;
CREATE POLICY "Admins can view call logs"
ON public.stroke_call_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrict stroke_contacts SELECT to admins
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.stroke_contacts;
CREATE POLICY "Admins can view contacts"
ON public.stroke_contacts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict stroke_settings SELECT to admins
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.stroke_settings;
CREATE POLICY "Admins can view settings"
ON public.stroke_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix privilege escalation on user_roles: only admins can insert
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policy for admins
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Revoke EXECUTE on has_role from anon/authenticated (RLS still uses it as SECURITY DEFINER from policy contexts run by the table owner)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 6. Realtime authorization: restrict realtime.messages so users can only subscribe to their own topics
-- Allow authenticated users to receive realtime broadcasts/presence only on topics they're authorized for
DROP POLICY IF EXISTS "Authenticated users can read own realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated users can read own realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow patient channels (patients table data already RLS-protected)
  (realtime.topic() LIKE 'patients:%')
  OR (realtime.topic() LIKE 'patient_presence:%')
  -- Restrict user_feedback channel to own user_id topic
  OR (realtime.topic() = 'user_feedback:' || auth.uid()::text)
);

DROP POLICY IF EXISTS "Authenticated users can publish realtime presence" ON realtime.messages;
CREATE POLICY "Authenticated users can publish realtime presence"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() LIKE 'patients:%')
  OR (realtime.topic() LIKE 'patient_presence:%')
  OR (realtime.topic() = 'user_feedback:' || auth.uid()::text)
);
