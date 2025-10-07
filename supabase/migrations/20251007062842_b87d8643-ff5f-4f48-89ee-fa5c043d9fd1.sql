-- Add RLS policies for reviews table to allow inserting reviews

-- Allow authenticated users to insert reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anonymous users to insert reviews (for public review submissions)
CREATE POLICY "Anyone can create reviews"
ON public.reviews
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to update their own reviews (if we want to support editing)
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (service_id IN (
  SELECT id FROM services WHERE true
))
WITH CHECK (service_id IN (
  SELECT id FROM services WHERE true
));