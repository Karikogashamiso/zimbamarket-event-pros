-- Add cascading deletes for transport-related foreign keys

-- Drop existing foreign key constraints and recreate with CASCADE
ALTER TABLE public.transport_trips
DROP CONSTRAINT IF EXISTS transport_trips_route_id_fkey,
ADD CONSTRAINT transport_trips_route_id_fkey 
  FOREIGN KEY (route_id) 
  REFERENCES public.transport_routes(id) 
  ON DELETE CASCADE;

ALTER TABLE public.ticket_types
DROP CONSTRAINT IF EXISTS ticket_types_trip_id_fkey,
ADD CONSTRAINT ticket_types_trip_id_fkey 
  FOREIGN KEY (trip_id) 
  REFERENCES public.transport_trips(id) 
  ON DELETE CASCADE;

ALTER TABLE public.tickets
DROP CONSTRAINT IF EXISTS tickets_ticket_type_id_fkey,
ADD CONSTRAINT tickets_ticket_type_id_fkey 
  FOREIGN KEY (ticket_type_id) 
  REFERENCES public.ticket_types(id) 
  ON DELETE CASCADE;

ALTER TABLE public.passenger_checkins
DROP CONSTRAINT IF EXISTS passenger_checkins_ticket_id_fkey,
ADD CONSTRAINT passenger_checkins_ticket_id_fkey 
  FOREIGN KEY (ticket_id) 
  REFERENCES public.tickets(id) 
  ON DELETE CASCADE;

ALTER TABLE public.event_addons
DROP CONSTRAINT IF EXISTS event_addons_trip_id_fkey,
ADD CONSTRAINT event_addons_trip_id_fkey 
  FOREIGN KEY (trip_id) 
  REFERENCES public.transport_trips(id) 
  ON DELETE CASCADE;