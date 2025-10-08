-- Fix services RLS policy to use business_listing_id for proper ownership
-- Drop the insecure policy that uses category_id
DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;

-- Create proper policy using business_listing_id
CREATE POLICY "Service owners can manage their services"
ON public.services
FOR ALL
USING (
  business_listing_id IN (
    SELECT id FROM public.business_listings WHERE user_id = auth.uid()
  )
);

-- Allow users to view all active services (for browsing)
CREATE POLICY "Anyone can view active services for browsing"
ON public.services
FOR SELECT
USING (active = true OR business_listing_id IN (
  SELECT id FROM public.business_listings WHERE user_id = auth.uid()
));