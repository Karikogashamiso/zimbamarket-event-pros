-- Drop the problematic policy
DROP POLICY IF EXISTS "Organizers can view orders for their events/trips" ON public.orders;

-- Create a security definer function to check if a user is an organizer for an order
CREATE OR REPLACE FUNCTION public.is_organizer_for_order(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    LEFT JOIN events e ON tt.event_id = e.id
    LEFT JOIN transport_trips tr ON tt.trip_id = tr.id
    LEFT JOIN transport_routes r ON tr.route_id = r.id
    LEFT JOIN organizers o1 ON e.organizer_id = o1.id
    LEFT JOIN organizers o2 ON r.organizer_id = o2.id
    WHERE t.order_id = _order_id
      AND (o1.user_id = _user_id OR o2.user_id = _user_id)
  );
$$;

-- Create the new policy using the security definer function
CREATE POLICY "Organizers can view orders for their events/trips"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_organizer_for_order(id, auth.uid()));