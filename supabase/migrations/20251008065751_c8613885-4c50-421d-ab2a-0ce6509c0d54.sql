-- Link existing services to business listings based on category_id and user ownership
-- This helps ensure that when a business listing is rejected, its services are properly deactivated

UPDATE public.services s
SET business_listing_id = bl.id
FROM public.business_listings bl
WHERE s.category_id = bl.category_id
  AND s.business_listing_id IS NULL
  AND bl.status = 'approved';

-- Add comment explaining the relationship
COMMENT ON COLUMN public.services.business_listing_id IS 'Links service to the business listing. Services are automatically deactivated when their business listing is rejected.';