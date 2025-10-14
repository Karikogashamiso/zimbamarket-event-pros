-- Remove the policy that allows service owners to book their own services
DROP POLICY IF EXISTS "Service owners can book their own services" ON public.booking_requests;

-- Add a policy to PREVENT organizers from booking their own services
CREATE POLICY "Prevent service owners from creating booking requests"
ON public.booking_requests
FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 
    FROM services s
    JOIN business_listings bl ON s.business_listing_id = bl.id
    WHERE s.id = booking_requests.service_id
    AND bl.user_id = auth.uid()
  )
);

-- Add check to prevent organizers from buying their own event tickets
-- This will be enforced at the order creation level
CREATE OR REPLACE FUNCTION public.user_owns_event(event_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM events e
    JOIN organizers o ON e.organizer_id = o.id
    WHERE e.id = event_id_param
    AND o.user_id = user_id_param
  );
$$;