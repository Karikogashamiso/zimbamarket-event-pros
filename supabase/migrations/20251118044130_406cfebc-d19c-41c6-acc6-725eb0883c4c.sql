-- Update business listings with actual asset images and complete details

-- Update Cresta Lodge Harare
UPDATE business_listings
SET 
  images = ARRAY['/src/assets/cresta-lodge-harare.jpg'],
  description = 'Premier hotel and conference facility in Harare offering elegant event spaces, comfortable accommodation, and professional service for weddings, conferences, and corporate events. Features modern amenities, outdoor gardens, and versatile meeting rooms suitable for various occasions.',
  amenities = ARRAY['Conference Rooms', 'Wedding Venue', 'Accommodation', 'Full Catering Service', 'Audio/Visual Equipment', 'Outdoor Gardens', 'Secure Parking', 'Free WiFi', 'Restaurant', 'Bar'],
  website = 'https://www.crestalodge.co.zw',
  address = 'Cresta Lodge, 10 Borrowdale Road, Msasa, Harare, Zimbabwe'
WHERE business_name = 'Cresta Lodge Harare';

-- Update Meikles Hotel
UPDATE business_listings
SET 
  images = ARRAY['/src/assets/meikles-hotel.jpg'],
  description = 'Zimbabwe''s most iconic luxury hotel in the heart of Harare. Offering world-class facilities for weddings, conferences, and special events. Known for exceptional service, elegant ballrooms, premium dining experiences, and a rich history of hosting prestigious events.',
  amenities = ARRAY['Grand Ballroom', 'Multiple Conference Rooms', 'Luxury Accommodation', 'Fine Dining', 'Spa & Wellness Center', 'Fitness Center', 'Business Center', 'Valet Parking', '24/7 Concierge', 'Rooftop Terrace'],
  website = 'https://www.meikles.com',
  address = 'Jason Moyo Avenue & Third Street, Central Harare, Zimbabwe'
WHERE business_name = 'Meikles Hotel';

-- Update Rainbow Towers Hotel
UPDATE business_listings
SET 
  images = ARRAY['/src/assets/rainbow-towers-hotel.jpg'],
  description = 'Modern hotel and events venue offering versatile spaces for conferences, weddings, and social gatherings. Features contemporary facilities, professional event coordination, excellent catering services, and convenient location in Harare.',
  amenities = ARRAY['Conference Facilities', 'Wedding Venue', 'Hotel Rooms', 'Restaurant', 'Bar & Lounge', 'Event Coordination', 'Professional Catering', 'Secure Parking', 'WiFi', 'Pool'],
  website = 'https://www.rainbowtowers.co.zw',
  address = 'Rainbow Towers, Harare, Zimbabwe'
WHERE business_name = 'Rainbow Towers Hotel';

-- Update Royal Gardens Wedding Venue
UPDATE business_listings
SET 
  images = ARRAY['/src/assets/royal-gardens-wedding-venue.jpg'],
  description = 'Exclusive wedding and events venue featuring stunning gardens, elegant reception halls, and personalized service. Specializing in creating unforgettable wedding experiences with beautiful outdoor and indoor spaces, professional wedding coordination, and attention to every detail.',
  amenities = ARRAY['Garden Ceremony Area', 'Reception Hall', 'Bridal Suite', 'Multiple Photography Areas', 'Professional Catering Kitchen', 'Dance Floor', 'Full Bar Service', 'Ample Parking', 'Wedding Coordination', 'Sound System'],
  website = 'https://www.royalgardens.co.zw',
  address = 'Royal Gardens, Borrowdale Road, Borrowdale, Harare, Zimbabwe'
WHERE business_name = 'Royal Gardens Wedding Venue';