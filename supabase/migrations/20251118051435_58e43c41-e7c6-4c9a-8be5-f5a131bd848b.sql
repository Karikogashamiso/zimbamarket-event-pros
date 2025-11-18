-- Update business listing images to use full Supabase Storage URLs
-- This will work in production

UPDATE business_listings
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/cresta-lodge-harare.jpg']
WHERE business_name = 'Cresta Lodge Harare';

UPDATE business_listings
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/meikles-hotel.jpg']
WHERE business_name = 'Meikles Hotel';

UPDATE business_listings
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/rainbow-towers-hotel.jpg']
WHERE business_name = 'Rainbow Towers Hotel';

UPDATE business_listings
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/royal-gardens-wedding-venue.jpg']
WHERE business_name = 'Royal Gardens Wedding Venue';

-- Update services images as well
UPDATE services
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/cresta-lodge-harare.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Cresta Lodge Harare'
);

UPDATE services
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/meikles-hotel.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Meikles Hotel'
);

UPDATE services
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/rainbow-towers-hotel.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Rainbow Towers Hotel'
);

UPDATE services
SET images = ARRAY['https://pxpdjfkppgoaygdfmaqr.supabase.co/storage/v1/object/public/business-images/venues/royal-gardens-wedding-venue.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Royal Gardens Wedding Venue'
);