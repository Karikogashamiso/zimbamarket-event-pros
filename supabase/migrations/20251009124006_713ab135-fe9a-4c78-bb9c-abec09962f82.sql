-- Fix RLS policies to allow service owners to book/buy their own services and transport

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service owners can book their own services" ON public.booking_requests;
DROP POLICY IF EXISTS "Service owners can view and manage orders for their services" ON public.orders;
DROP POLICY IF EXISTS "Service owners can view tickets for their events/trips" ON public.tickets;

-- Allow service owners to create bookings for their own services
CREATE POLICY "Service owners can book their own services"
ON public.booking_requests
FOR INSERT
WITH CHECK (
  service_id IN (
    SELECT s.id
    FROM services s
    JOIN business_listings bl ON s.business_listing_id = bl.id
    WHERE bl.user_id = auth.uid()
  )
);

-- Allow service owners to view and manage orders for their services
CREATE POLICY "Service owners can view and manage orders for their services"
ON public.orders
FOR ALL
USING (
  id IN (
    SELECT DISTINCT o.id
    FROM orders o
    JOIN tickets t ON t.order_id = o.id
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    LEFT JOIN events e ON tt.event_id = e.id
    LEFT JOIN transport_trips tr ON tt.trip_id = tr.id
    LEFT JOIN transport_routes r ON tr.route_id = r.id
    LEFT JOIN organizers org1 ON e.organizer_id = org1.id
    LEFT JOIN organizers org2 ON r.organizer_id = org2.id
    WHERE org1.user_id = auth.uid() OR org2.user_id = auth.uid()
  )
);

-- Allow service owners to view tickets for their events/trips
CREATE POLICY "Service owners can view tickets for their events/trips"
ON public.tickets
FOR SELECT
USING (
  ticket_type_id IN (
    SELECT tt.id
    FROM ticket_types tt
    LEFT JOIN events e ON tt.event_id = e.id
    LEFT JOIN transport_trips tr ON tt.trip_id = tr.id
    LEFT JOIN transport_routes r ON tr.route_id = r.id
    LEFT JOIN organizers org1 ON e.organizer_id = org1.id
    LEFT JOIN organizers org2 ON r.organizer_id = org2.id
    WHERE org1.user_id = auth.uid() OR org2.user_id = auth.uid()
  )
);