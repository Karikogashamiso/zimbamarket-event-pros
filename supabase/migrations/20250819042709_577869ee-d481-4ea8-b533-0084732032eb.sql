-- Create analytics tables for business intelligence
CREATE TABLE public.booking_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'inquiry', 'booking', 'conversion', 'cancellation')),
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing models table
CREATE TABLE public.pricing_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  base_price DECIMAL(10,2) NOT NULL,
  peak_multiplier DECIMAL(3,2) DEFAULT 1.0,
  off_peak_multiplier DECIMAL(3,2) DEFAULT 0.8,
  demand_threshold INTEGER DEFAULT 80, -- percentage capacity
  seasonal_adjustments JSONB DEFAULT '{}',
  dynamic_pricing_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability calendar table
CREATE TABLE public.service_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TIME,
  is_available BOOLEAN DEFAULT true,
  max_capacity INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  price_override DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, date, time_slot)
);

-- Create conflict detection table
CREATE TABLE public.booking_conflicts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  conflict_date DATE NOT NULL,
  conflict_time TIME,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('overbooking', 'unavailable', 'maintenance', 'holiday')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create translations table for multi-language support
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  language_code TEXT NOT NULL CHECK (language_code IN ('en', 'sn', 'nd')), -- English, Shona, Ndebele
  value TEXT NOT NULL,
  context TEXT, -- for disambiguation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, language_code, context)
);

-- Create business metrics materialized view
CREATE MATERIALIZED VIEW public.business_metrics AS
SELECT 
  s.id as service_id,
  s.title as service_name,
  COUNT(CASE WHEN ba.event_type = 'view' THEN 1 END) as total_views,
  COUNT(CASE WHEN ba.event_type = 'inquiry' THEN 1 END) as total_inquiries,
  COUNT(CASE WHEN ba.event_type = 'booking' THEN 1 END) as total_bookings,
  COUNT(CASE WHEN ba.event_type = 'conversion' THEN 1 END) as total_conversions,
  CASE 
    WHEN COUNT(CASE WHEN ba.event_type = 'view' THEN 1 END) > 0 
    THEN ROUND((COUNT(CASE WHEN ba.event_type = 'inquiry' THEN 1 END)::decimal / COUNT(CASE WHEN ba.event_type = 'view' THEN 1 END)) * 100, 2)
    ELSE 0 
  END as inquiry_conversion_rate,
  CASE 
    WHEN COUNT(CASE WHEN ba.event_type = 'inquiry' THEN 1 END) > 0 
    THEN ROUND((COUNT(CASE WHEN ba.event_type = 'booking' THEN 1 END)::decimal / COUNT(CASE WHEN ba.event_type = 'inquiry' THEN 1 END)) * 100, 2)
    ELSE 0 
  END as booking_conversion_rate,
  DATE_TRUNC('month', CURRENT_DATE) as period
FROM public.services s
LEFT JOIN public.booking_analytics ba ON s.id = ba.service_id
WHERE s.active = true
GROUP BY s.id, s.title;

-- Enable RLS on all new tables
ALTER TABLE public.booking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_analytics
CREATE POLICY "Anyone can create analytics events" 
ON public.booking_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service owners can view their analytics" 
ON public.booking_analytics 
FOR SELECT 
USING (
  service_id IN (
    SELECT id FROM public.services WHERE category_id IN (
      SELECT category_id FROM public.business_listings WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Admins can view all analytics" 
ON public.booking_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for pricing_models
CREATE POLICY "Service owners can manage their pricing" 
ON public.pricing_models 
FOR ALL 
USING (
  service_id IN (
    SELECT id FROM public.services WHERE category_id IN (
      SELECT category_id FROM public.business_listings WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Anyone can view pricing models" 
ON public.pricing_models 
FOR SELECT 
USING (true);

-- RLS Policies for service_availability
CREATE POLICY "Service owners can manage availability" 
ON public.service_availability 
FOR ALL 
USING (
  service_id IN (
    SELECT id FROM public.services WHERE category_id IN (
      SELECT category_id FROM public.business_listings WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Anyone can view availability" 
ON public.service_availability 
FOR SELECT 
USING (true);

-- RLS Policies for booking_conflicts
CREATE POLICY "Service owners can manage conflicts" 
ON public.booking_conflicts 
FOR ALL 
USING (
  service_id IN (
    SELECT id FROM public.services WHERE category_id IN (
      SELECT category_id FROM public.business_listings WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for translations
CREATE POLICY "Admins can manage translations" 
ON public.translations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_booking_analytics_service_id ON public.booking_analytics(service_id);
CREATE INDEX idx_booking_analytics_event_type ON public.booking_analytics(event_type);
CREATE INDEX idx_booking_analytics_created_at ON public.booking_analytics(created_at);
CREATE INDEX idx_service_availability_service_date ON public.service_availability(service_id, date);
CREATE INDEX idx_translations_key_lang ON public.translations(key, language_code);

-- Create triggers for updated_at columns
CREATE TRIGGER update_pricing_models_updated_at
BEFORE UPDATE ON public.pricing_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_availability_updated_at
BEFORE UPDATE ON public.service_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample translations for Zimbabwe
INSERT INTO public.translations (key, language_code, value, context) VALUES
('common.welcome', 'en', 'Welcome', 'greeting'),
('common.welcome', 'sn', 'Mauya', 'greeting'),
('common.welcome', 'nd', 'Siyakwamukela', 'greeting'),
('common.search', 'en', 'Search', 'action'),
('common.search', 'sn', 'Kutsvaga', 'action'),
('common.search', 'nd', 'Dinga', 'action'),
('common.book_now', 'en', 'Book Now', 'action'),
('common.book_now', 'sn', 'Dhirika Zvino', 'action'),
('common.book_now', 'nd', 'Buka Khathesi', 'action'),
('common.services', 'en', 'Services', 'navigation'),
('common.services', 'sn', 'Masevhisi', 'navigation'),
('common.services', 'nd', 'Amasevisi', 'navigation'),
('common.contact', 'en', 'Contact', 'navigation'),
('common.contact', 'sn', 'Kubata', 'navigation'),
('common.contact', 'nd', 'Xhumana', 'navigation');

-- Create function to refresh business metrics
CREATE OR REPLACE FUNCTION refresh_business_metrics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW public.business_metrics;
$$;