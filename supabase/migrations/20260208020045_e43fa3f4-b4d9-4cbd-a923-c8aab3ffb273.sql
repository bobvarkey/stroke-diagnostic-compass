-- Drop existing permissive policies on stroke tables
DROP POLICY IF EXISTS "Allow all access to stroke_contacts" ON public.stroke_contacts;
DROP POLICY IF EXISTS "Allow all access to stroke_settings" ON public.stroke_settings;
DROP POLICY IF EXISTS "Allow all access to stroke_activations" ON public.stroke_activations;
DROP POLICY IF EXISTS "Allow all access to stroke_call_logs" ON public.stroke_call_logs;

-- Stroke Contacts: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view contacts"
ON public.stroke_contacts
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert contacts"
ON public.stroke_contacts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contacts"
ON public.stroke_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contacts"
ON public.stroke_contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Stroke Settings: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view settings"
ON public.stroke_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert settings"
ON public.stroke_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.stroke_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.stroke_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Stroke Activations: All authenticated users can view and create, admins can update/delete
CREATE POLICY "Authenticated users can view activations"
ON public.stroke_activations
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create activations"
ON public.stroke_activations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update activations"
ON public.stroke_activations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete activations"
ON public.stroke_activations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Stroke Call Logs: All authenticated users can view and create, admins can update/delete
CREATE POLICY "Authenticated users can view call logs"
ON public.stroke_call_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create call logs"
ON public.stroke_call_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update call logs"
ON public.stroke_call_logs
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete call logs"
ON public.stroke_call_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));