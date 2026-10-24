-- 2026-10-24 — Owner allowlist: permanent developer access for specific accounts.
--
-- Access remains a server-side `user_entitlements` row keyed to the auth user id (see AGENTS.md).
-- Nothing here lets a browser claim access: the allowlist is read only by SECURITY DEFINER code,
-- the table has RLS enabled with no policies, and the grant is written server-side.
--
-- Apply AFTER drizzle migration 0000 (user_entitlements) and the premium-access migration.

DO $$
BEGIN
  IF to_regclass('public.user_entitlements') IS NULL THEN
    RAISE EXCEPTION 'public.user_entitlements is missing — apply drizzle migration 0000 first';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.access_allowlist (
  email      text PRIMARY KEY,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_allowlist ENABLE ROW LEVEL SECURITY;

-- No policies means anon/authenticated see nothing; revoke the table grant as well so the
-- allowlist cannot be enumerated even by a future permissive policy.
REVOKE ALL ON public.access_allowlist FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON public.access_allowlist FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON public.access_allowlist FROM authenticated';
  END IF;
END $$;

INSERT INTO public.access_allowlist (email, note) VALUES
  ('bobvarkey@gmail.com',  'Owner'),
  ('bobvarkey1@gmail.com', 'Owner')
ON CONFLICT (email) DO NOTHING;

-- Grants permanent developer access when (and only when) the email is allowlisted. Callable by
-- trigger code and the service role; revoked from clients.
CREATE OR REPLACE FUNCTION public.grant_allowlisted_access(p_user_id uuid, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR p_email IS NULL THEN
    RETURN false;
  END IF;

  -- Sign-in identity is not enough: the address must actually belong to this account, i.e.
  -- Supabase has confirmed it. This stops an unconfirmed sign-up with an allowlisted address
  -- (possible when "confirm email" is disabled) from receiving access.
  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = p_user_id
      AND u.email_confirmed_at IS NOT NULL
      AND lower(u.email) = lower(p_email)
  ) THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.access_allowlist a WHERE a.email = lower(p_email)
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_entitlements (user_id, kind, status, expires_at)
  VALUES (p_user_id, 'developer', 'active', NULL)
  ON CONFLICT (user_id, kind) DO UPDATE
    SET status     = 'active',
        expires_at = NULL;

  RETURN true;
END $$;

REVOKE ALL ON FUNCTION public.grant_allowlisted_access(uuid, text) FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.grant_allowlisted_access(uuid, text) FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.grant_allowlisted_access(uuid, text) FROM authenticated';
  END IF;
END $$;

-- Existing accounts: grant now (covers anyone who signed up before this migration).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT u.id, u.email
    FROM auth.users u
    JOIN public.access_allowlist a ON a.email = lower(u.email)
  LOOP
    PERFORM public.grant_allowlisted_access(r.id, r.email);
  END LOOP;
END $$;

-- New sign-ups, confirmations and email changes: grant only once the address is confirmed.
-- A change away from an allowlisted email does not revoke access retroactively.
CREATE OR REPLACE FUNCTION public.handle_allowlisted_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.grant_allowlisted_access(NEW.id, NEW.email);
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.handle_allowlisted_auth_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS allowlist_grant_on_auth_user ON auth.users;
CREATE TRIGGER allowlist_grant_on_auth_user
  AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_allowlisted_auth_user();

-- Verification (run manually):
--   SELECT a.email, e.kind, e.status, e.expires_at
--   FROM public.access_allowlist a
--   LEFT JOIN auth.users u ON lower(u.email) = a.email
--   LEFT JOIN public.user_entitlements e ON e.user_id = u.id AND e.kind = 'developer';
