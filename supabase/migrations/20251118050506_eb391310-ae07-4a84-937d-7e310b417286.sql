-- Revert business listing images back to local public folder paths
-- This restores the working image paths

-- Update Cresta Lodge Harare
UPDATE business_listings
SET images = ARRAY['/cresta-lodge-harare.jpg']
WHERE business_name = 'Cresta Lodge Harare';

-- Update Meikles Hotel
UPDATE business_listings
SET images = ARRAY['/meikles-hotel.jpg']
WHERE business_name = 'Meikles Hotel';

-- Update Rainbow Towers Hotel
UPDATE business_listings
SET images = ARRAY['/rainbow-towers-hotel.jpg']
WHERE business_name = 'Rainbow Towers Hotel';

-- Update Royal Gardens Wedding Venue
UPDATE business_listings
SET images = ARRAY['/royal-gardens-wedding-venue.jpg']
WHERE business_name = 'Royal Gardens Wedding Venue';

-- Update services images as well
UPDATE services
SET images = ARRAY['/cresta-lodge-harare.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Cresta Lodge Harare'
);

UPDATE services
SET images = ARRAY['/meikles-hotel.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Meikles Hotel'
);

UPDATE services
SET images = ARRAY['/rainbow-towers-hotel.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Rainbow Towers Hotel'
);

UPDATE services
SET images = ARRAY['/royal-gardens-wedding-venue.jpg']
WHERE business_listing_id IN (
  SELECT id FROM business_listings WHERE business_name = 'Royal Gardens Wedding Venue'
);