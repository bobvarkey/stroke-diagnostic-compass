-- Create enum for contact roles
CREATE TYPE public.stroke_contact_role AS ENUM (
  'neurologist',
  'er_physician',
  'radiologist',
  'stroke_nurse',
  'ct_tech',
  'pharmacist',
  'neurosurgeon',
  'icu_physician',
  'lab_tech'
);

-- Create enum for code levels
CREATE TYPE public.stroke_code_level AS ENUM ('code_1', 'code_2');

-- Create enum for call status
CREATE TYPE public.stroke_call_status AS ENUM ('pending', 'calling', 'success', 'failed', 'no_answer');

-- Stroke team contacts table
CREATE TABLE public.stroke_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  role stroke_contact_role NOT NULL,
  code_level stroke_code_level NOT NULL DEFAULT 'code_2',
  priority_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System settings table
CREATE TABLE public.stroke_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id TEXT NOT NULL DEFAULT 'FACILITY-001',
  nsa_phone_number TEXT,
  nsa_enabled BOOLEAN NOT NULL DEFAULT true,
  voice_message_code_1 TEXT DEFAULT 'Stroke Code 1 activated. This is an emergency. Please respond immediately.',
  voice_message_code_2 TEXT DEFAULT 'Stroke Code 2 activated. Please respond as soon as possible.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stroke code activations table
CREATE TABLE public.stroke_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_level stroke_code_level NOT NULL,
  patient_id TEXT NOT NULL,
  location TEXT NOT NULL,
  activated_by TEXT,
  nsa_notified BOOLEAN NOT NULL DEFAULT false,
  nsa_notification_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual call logs for each activation
CREATE TABLE public.stroke_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activation_id UUID NOT NULL REFERENCES public.stroke_activations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.stroke_contacts(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  role stroke_contact_role NOT NULL,
  call_status stroke_call_status NOT NULL DEFAULT 'pending',
  call_started_at TIMESTAMP WITH TIME ZONE,
  call_ended_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stroke_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stroke_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stroke_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stroke_call_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (this is an emergency system)
CREATE POLICY "Allow all access to stroke_contacts" ON public.stroke_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stroke_settings" ON public.stroke_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stroke_activations" ON public.stroke_activations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stroke_call_logs" ON public.stroke_call_logs FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO public.stroke_settings (facility_id, nsa_phone_number, nsa_enabled) 
VALUES ('FACILITY-001', NULL, true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_stroke_contacts_updated_at
  BEFORE UPDATE ON public.stroke_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_stroke_settings_updated_at
  BEFORE UPDATE ON public.stroke_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();