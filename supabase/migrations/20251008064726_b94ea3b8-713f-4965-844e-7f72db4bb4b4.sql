-- Add business_listing_id to services table to link services to their business listings
ALTER TABLE public.services
ADD COLUMN business_listing_id UUID REFERENCES public.business_listings(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_services_business_listing_id ON public.services(business_listing_id);

-- Add comment
COMMENT ON COLUMN public.services.business_listing_id IS 'Links service to the business listing that created it';