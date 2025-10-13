-- Create home_features table for feature highlights
CREATE TABLE public.home_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create home_stats table
CREATE TABLE public.home_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for home_features
CREATE POLICY "Anyone can view active features"
  ON public.home_features
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage features"
  ON public.home_features
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for home_stats
CREATE POLICY "Anyone can view active stats"
  ON public.home_stats
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage stats"
  ON public.home_stats
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_home_features_updated_at
  BEFORE UPDATE ON public.home_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_home_stats_updated_at
  BEFORE UPDATE ON public.home_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed home_features with existing data
INSERT INTO public.home_features (title, description, icon, features, display_order) VALUES
  ('Lightning Fast Booking', 'Book your experience in under 60 seconds with our optimized checkout flow', 'Zap', 
   '[{"text": "One-click repeat bookings"}, {"text": "Instant confirmation via WhatsApp"}, {"text": "No registration required for guests"}, {"text": "Smart form auto-fill"}]'::jsonb, 1),
  ('Bank-Grade Security', 'Your transactions are protected with military-grade encryption and anti-fraud systems', 'Shield', 
   '[{"text": "Anti-fraud QR codes"}, {"text": "SSL encryption"}, {"text": "PCI DSS compliant"}, {"text": "Fraud detection AI"}]'::jsonb, 2),
  ('Made for Mobile', 'Designed specifically for Zimbabwe''s mobile-first users with offline capabilities', 'Smartphone', 
   '[{"text": "Works on 2G/3G networks"}, {"text": "WhatsApp ticket delivery"}, {"text": "Offline ticket storage"}, {"text": "USSD backup system"}]'::jsonb, 3);

-- Seed home_stats with existing data
INSERT INTO public.home_stats (label, value, description, icon, display_order) VALUES
  ('Tickets Sold', '50,000+', 'Successfully processed across Zimbabwe', 'Ticket', 1),
  ('Happy Customers', '20,000+', 'Trusted by thousands nationwide', 'Users', 2),
  ('Uptime', '99.9%', 'Reliable service you can count on', 'Activity', 3);