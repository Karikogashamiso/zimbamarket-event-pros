-- Drop problematic RLS policies on orders table
DROP POLICY IF EXISTS "Service owners can view and manage orders for their services" ON public.orders;
DROP POLICY IF EXISTS "Organizers can view orders for their events/trips" ON public.orders;

-- Create a simpler function to check if user owns the order's tickets
CREATE OR REPLACE FUNCTION public.user_owns_order_tickets(_order_id uuid, _user_id uuid)
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

-- Recreate policies using the security definer function
CREATE POLICY "Organizers can view their orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_owns_order_tickets(id, auth.uid()));

CREATE POLICY "Organizers can update their orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (user_owns_order_tickets(id, auth.uid()));

-- Ensure admins can still see everything
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));