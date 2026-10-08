CREATE TABLE public.user_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,           -- developer | trial | subscription | demo
  status text NOT NULL DEFAULT 'active',
  plan_code text,
  amount_minor integer,
  currency text,
  razorpay_subscription_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,       -- null = no expiry (developer)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
GRANT SELECT ON public.user_entitlements TO authenticated;
GRANT ALL ON public.user_entitlements TO service_role;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own entitlements" ON public.user_entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_user_entitlements_updated_at BEFORE UPDATE ON public.user_entitlements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements e
    WHERE e.user_id = _user_id AND e.status = 'active'
      AND ((e.kind = 'developer' AND e.expires_at IS NULL) OR (e.expires_at IS NOT NULL AND e.expires_at > now()))
  )
$$;