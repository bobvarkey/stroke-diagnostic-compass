-- Enable realtime for patients table
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;

-- Add a field to track who is currently viewing/editing
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS active_editors jsonb DEFAULT '[]'::jsonb;

-- Create a table for tracking active sessions on patients (for presence)
CREATE TABLE IF NOT EXISTS public.patient_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, user_id)
);

-- Enable RLS on presence table
ALTER TABLE public.patient_presence ENABLE ROW LEVEL SECURITY;

-- Presence policies - anyone authenticated can see who's viewing
CREATE POLICY "Authenticated users can view presence"
  ON public.patient_presence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own presence"
  ON public.patient_presence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
  ON public.patient_presence FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presence"
  ON public.patient_presence FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_presence;

-- Create subscriptions table for Stripe
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('single', 'multi', 'enterprise')),
  max_users INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  is_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true);

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();