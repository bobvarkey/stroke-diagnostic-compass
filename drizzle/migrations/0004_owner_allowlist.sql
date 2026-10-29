CREATE TABLE IF NOT EXISTS public.access_allowlist (email text PRIMARY KEY, note text, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.access_allowlist TO service_role;
REVOKE ALL ON public.access_allowlist FROM anon, authenticated;
ALTER TABLE public.access_allowlist ENABLE ROW LEVEL SECURITY;
INSERT INTO public.access_allowlist (email, note) VALUES ('bobvarkey@gmail.com','Owner'),('bobvarkey1@gmail.com','Owner') ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.grant_allowlisted_access(p_user_id uuid, p_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_user_id IS NULL OR p_email IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p_user_id AND u.email_confirmed_at IS NOT NULL AND lower(u.email) = lower(p_email)) THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.access_allowlist a WHERE a.email = lower(p_email)) THEN RETURN false; END IF;
  UPDATE public.user_entitlements SET status='active', expires_at=NULL, updated_at=now() WHERE user_id=p_user_id AND kind='developer';
  IF NOT FOUND THEN
    INSERT INTO public.user_entitlements (user_id, kind, status, expires_at) VALUES (p_user_id, 'developer', 'active', NULL);
  END IF;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.grant_allowlisted_access(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_allowlisted_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.grant_allowlisted_access(NEW.id, NEW.email); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.handle_allowlisted_auth_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS allowlist_grant_on_auth_user ON auth.users;
CREATE TRIGGER allowlist_grant_on_auth_user AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_allowlisted_auth_user();

DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT u.id, u.email FROM auth.users u JOIN public.access_allowlist a ON a.email = lower(u.email) LOOP
    PERFORM public.grant_allowlisted_access(r.id, r.email);
  END LOOP;
END $$;