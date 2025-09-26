-- Add support for multiple images in services table
ALTER TABLE public.services 
ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing services to move image_url into images array
UPDATE public.services 
SET images = ARRAY[image_url]::TEXT[] 
WHERE image_url IS NOT NULL AND image_url != '';

-- Add some sample images for better testing
UPDATE public.services 
SET images = ARRAY[
  '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
  '/assets/venue-1.jpg',
  '/assets/hero-background.jpg'
]::TEXT[]
WHERE id = 'f8453f90-9933-499d-9915-aa5c3880768e';

UPDATE public.services 
SET images = ARRAY[
  '/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png',
  '/assets/catering-1.jpg',
  '/assets/meikles-hotel.jpg'
]::TEXT[]
WHERE id = '32dab1eb-4ec6-4ddc-af9c-1b7a6b1b5f0b';

UPDATE public.services 
SET images = ARRAY[
  '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png',
  '/assets/dj-1.jpg',
  '/assets/rainbow-towers-hotel.jpg'
]::TEXT[]
WHERE id = 'b2b3f3ea-8080-4836-afb7-bbdae751d95b';