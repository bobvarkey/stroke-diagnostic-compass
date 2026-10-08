CREATE TABLE IF NOT EXISTS public.razorpay_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.razorpay_webhook_events TO service_role;
ALTER TABLE public.razorpay_webhook_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_entitlements TO service_role;
GRANT SELECT ON public.user_entitlements TO authenticated;
CREATE UNIQUE INDEX IF NOT EXISTS user_entitlements_user_kind_uidx ON public.user_entitlements(user_id, kind);