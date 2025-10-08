-- Add policy to allow admins to create business listings on behalf of users
CREATE POLICY "Admins can create business listings for users"
ON public.business_listings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));