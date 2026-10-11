CREATE TABLE public.enterprise_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, email)
);
GRANT SELECT, INSERT, DELETE ON public.enterprise_members TO authenticated;
GRANT ALL ON public.enterprise_members TO service_role;
ALTER TABLE public.enterprise_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_active_enterprise(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_entitlements e WHERE e.user_id = _user_id AND e.kind = 'subscription'
    AND e.plan_code = 'stroke_enterprise' AND e.status IN ('active','cancelled') AND e.expires_at > now())
$$;

CREATE POLICY "Owners read own members" ON public.enterprise_members FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Enterprise owners add members" ON public.enterprise_members FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.has_active_enterprise(auth.uid()));
CREATE POLICY "Owners remove members" ON public.enterprise_members FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.enforce_enterprise_seats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  IF (SELECT count(*) FROM public.enterprise_members WHERE owner_id = NEW.owner_id) >= 50 THEN
    RAISE EXCEPTION 'Enterprise plan allows up to 50 people';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER enterprise_seat_limit BEFORE INSERT ON public.enterprise_members FOR EACH ROW EXECUTE FUNCTION public.enforce_enterprise_seats();

-- Member access: caller's confirmed email listed by an owner with an active Enterprise plan. Returns that plan's end date.
CREATE OR REPLACE FUNCTION public.my_enterprise_access()
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT max(e.expires_at) FROM public.enterprise_members m
  JOIN auth.users u ON u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL AND lower(u.email) = m.email
  JOIN public.user_entitlements e ON e.user_id = m.owner_id AND e.kind = 'subscription' AND e.plan_code = 'stroke_enterprise'
    AND e.status IN ('active','cancelled') AND e.expires_at > now()
$$;
REVOKE ALL ON FUNCTION public.my_enterprise_access() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_enterprise_access() TO authenticated;

CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements e
    WHERE e.user_id = _user_id AND e.status = 'active'
      AND ((e.kind = 'developer' AND e.expires_at IS NULL) OR (e.expires_at IS NOT NULL AND e.expires_at > now()))
  ) OR EXISTS (
    SELECT 1 FROM public.enterprise_members m
    JOIN auth.users u ON u.id = _user_id AND u.email_confirmed_at IS NOT NULL AND lower(u.email) = m.email
    WHERE public.has_active_enterprise(m.owner_id)
  )
$$;