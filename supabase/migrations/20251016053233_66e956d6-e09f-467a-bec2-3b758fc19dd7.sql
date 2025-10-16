-- Make images mandatory for services and business_listings
-- Drop existing constraints if they exist to avoid conflicts
ALTER TABLE public.services 
DROP CONSTRAINT IF EXISTS services_images_not_empty;

ALTER TABLE public.business_listings 
DROP CONSTRAINT IF EXISTS business_listings_images_not_empty;

-- Update any existing NULL values to empty arrays
UPDATE public.services 
SET images = '{}' 
WHERE images IS NULL;

UPDATE public.business_listings 
SET images = '{}' 
WHERE images IS NULL;

-- Make images column NOT NULL
ALTER TABLE public.services 
ALTER COLUMN images SET NOT NULL,
ALTER COLUMN images SET DEFAULT '{}';

ALTER TABLE public.business_listings 
ALTER COLUMN images SET NOT NULL,
ALTER COLUMN images SET DEFAULT '{}';

-- Add check constraints to ensure at least one image is present
ALTER TABLE public.services 
ADD CONSTRAINT services_images_not_empty 
CHECK (array_length(images, 1) > 0);

ALTER TABLE public.business_listings 
ADD CONSTRAINT business_listings_images_not_empty 
CHECK (array_length(images, 1) > 0);

-- Also make the image_url field in services NOT NULL as a fallback
UPDATE public.services 
SET image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' 
WHERE image_url IS NULL;

ALTER TABLE public.services 
ALTER COLUMN image_url SET NOT NULL;