-- Create event_addons table
CREATE TABLE public.event_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.transport_trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  currency currency_code NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_quantity INTEGER DEFAULT 10,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT event_or_trip_check CHECK (
    (event_id IS NOT NULL AND trip_id IS NULL) OR 
    (event_id IS NULL AND trip_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.event_addons ENABLE ROW LEVEL SECURITY;

-- Anyone can view active add-ons
CREATE POLICY "Anyone can view active event add-ons"
ON public.event_addons
FOR SELECT
USING (is_active = true);

-- Organizers can manage their event add-ons
CREATE POLICY "Organizers can manage their event add-ons"
ON public.event_addons
FOR ALL
USING (
  event_id IN (
    SELECT e.id FROM events e
    JOIN organizers o ON e.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  ) OR
  trip_id IN (
    SELECT t.id FROM transport_trips t
    JOIN transport_routes r ON t.route_id = r.id
    JOIN organizers o ON r.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_event_addons_updated_at
BEFORE UPDATE ON public.event_addons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_event_addons_event_id ON public.event_addons(event_id);
CREATE INDEX idx_event_addons_trip_id ON public.event_addons(trip_id);