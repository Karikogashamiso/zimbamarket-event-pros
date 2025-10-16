-- Fix booking_requests RLS policies to allow both guests and authenticated users

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Anyone can create booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Prevent service owners from creating booking requests" ON public.booking_requests;

-- Create new policy that allows anyone to insert, but blocks service owners
CREATE POLICY "Anyone can create booking requests" 
ON public.booking_requests
FOR INSERT
WITH CHECK (
  -- Allow if user is not authenticated (guest)
  auth.uid() IS NULL
  OR
  -- Allow if user is authenticated but doesn't own the service
  NOT EXISTS (
    SELECT 1
    FROM services s
    JOIN business_listings bl ON s.business_listing_id = bl.id
    WHERE s.id = booking_requests.service_id
    AND bl.user_id = auth.uid()
  )
);