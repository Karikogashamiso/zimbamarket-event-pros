-- Make images mandatory for services and business_listings

-- First, update any existing NULL values to empty arrays
UPDATE public.services 
SET images = '{}' 
WHERE images IS NULL;

UPDATE public.business_listings 
SET images = '{}' 
WHERE images IS NULL;

-- Make images column NOT NULL and add constraint to ensure at least one image
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
-- First set a default placeholder for NULL values
UPDATE public.services 
SET image_url = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' 
WHERE image_url IS NULL;

ALTER TABLE public.services 
ALTER COLUMN image_url SET NOT NULL;