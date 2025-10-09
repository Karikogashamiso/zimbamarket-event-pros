-- Add image uploads and featured/verified functionality to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create index for faster queries on featured/verified services
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_services_verified ON public.services(is_verified) WHERE is_verified = true;