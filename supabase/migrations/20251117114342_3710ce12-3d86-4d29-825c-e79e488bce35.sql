
-- Allow business owners to feature their own businesses
CREATE POLICY "Users can feature their own business listings"
ON public.business_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow business owners to toggle featured status on their services
CREATE POLICY "Service owners can update featured status"
ON public.services
FOR UPDATE
TO authenticated
USING (business_listing_id IN (
  SELECT id FROM business_listings WHERE user_id = auth.uid()
))
WITH CHECK (business_listing_id IN (
  SELECT id FROM business_listings WHERE user_id = auth.uid()
));
