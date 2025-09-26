-- Create user saved services table
CREATE TABLE public.user_saved_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

-- Enable RLS
ALTER TABLE public.user_saved_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own saved services"
ON public.user_saved_services
FOR ALL
USING (auth.uid() = user_id);

-- Create service analytics table
CREATE TABLE public.service_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  user_id UUID,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics
CREATE POLICY "Anyone can create analytics events"
ON public.service_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service owners can view their analytics"
ON public.service_analytics
FOR SELECT
USING (
  service_id IN (
    SELECT s.id FROM services s 
    WHERE s.category_id IN (
      SELECT bl.category_id FROM business_listings bl 
      WHERE bl.user_id = auth.uid()
    )
  )
);

-- Create service reports table
CREATE TABLE public.service_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL,
  reported_by_user_id UUID,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  report_data JSONB DEFAULT '{}',
  resolved_by_user_id UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Anyone can create reports"
ON public.service_reports
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all reports"
ON public.service_reports
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_service_reports_updated_at
BEFORE UPDATE ON public.service_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();