-- 2026-10-09 — Make premium access a real server-side boundary on patient data.
--
-- ⚠️  READ BEFORE APPLYING. This changes WHO can read and write public.patients. Today any
--     authenticated user can read and write their own rows; after this, a server-recorded
--     entitlement is also required. Any existing signed-in user with no trial, subscription or
--     developer grant will lose access to the patient rows they created. Apply deliberately.
--
--     This is also the only migration here that assumes the drizzle-defined billing tables have
--     already been applied. The guard below fails with an explicit message rather than a
--     confusing one if they have not.

DO $$
BEGIN
  IF to_regclass('public.user_entitlements') IS NULL THEN
    RAISE EXCEPTION 'public.user_entitlements is missing — apply the drizzle billing migrations (0000/0001) before this one';
  END IF;
  IF to_regclass('public.patients') IS NULL THEN
    RAISE EXCEPTION 'public.patients is missing — apply the base schema migration before this one';
  END IF;
END $$;

-- The previous premium predicate, has_premium_access(uuid), was referenced by no policy and no
-- caller, and was executable by any client — so it could probe another user's status. Policies
-- now call the zero-argument is_premium() below, which cannot answer about anyone but the caller.
REVOKE ALL ON FUNCTION public.has_premium_access(uuid) FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.has_premium_access(uuid) FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.has_premium_access(uuid) FROM authenticated';
  END IF;
END $$;

-- Premium = an active developer grant with no expiry, or an unexpired trial, subscription or
-- server-recorded demo. Mirrors isEntitlementActive() in src/hooks/useEntitlement.ts.
CREATE OR REPLACE FUNCTION public.is_premium()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements e
    WHERE e.user_id = auth.uid()
      AND (
        (e.kind = 'developer' AND e.status = 'active' AND e.expires_at IS NULL)
        OR (e.kind IN ('trial', 'subscription', 'demo')
            AND e.status IN ('active', 'cancelled')
            AND e.expires_at IS NOT NULL
            AND e.expires_at > now())
      )
  )
$$;

REVOKE ALL ON FUNCTION public.is_premium() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_premium() TO authenticated;

-- Re-create the patient policies with the entitlement check folded in. Admins keep access.
DROP POLICY IF EXISTS "Users can view own patients, admins can view all" ON public.patients;
CREATE POLICY "Premium users can view own patients, admins can view all"
  ON public.patients FOR SELECT TO authenticated
  USING (
    (public.is_premium() OR public.has_role(auth.uid(), 'admin'))
    AND (created_by = auth.uid() OR last_edited_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.patients;
CREATE POLICY "Premium users can create patients"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (public.is_premium() AND auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own patients, admins can update all" ON public.patients;
CREATE POLICY "Premium users can update own patients, admins can update all"
  ON public.patients FOR UPDATE TO authenticated
  USING (
    (public.is_premium() OR public.has_role(auth.uid(), 'admin'))
    AND (created_by = auth.uid() OR last_edited_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS "Users can delete own patients, admins can delete all" ON public.patients;
CREATE POLICY "Premium users can delete own patients, admins can delete all"
  ON public.patients FOR DELETE TO authenticated
  USING (
    (public.is_premium() OR public.has_role(auth.uid(), 'admin'))
    AND (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );
