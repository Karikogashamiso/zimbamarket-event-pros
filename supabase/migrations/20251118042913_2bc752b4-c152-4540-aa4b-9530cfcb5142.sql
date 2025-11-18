-- Create Venues category if it doesn't exist
INSERT INTO categories (name, slug, icon, description)
VALUES (
  'Venues & Hotels',
  'venues',
  'Building',
  'Premium venues, hotels, and event spaces for your special occasions'
)
ON CONFLICT (slug) DO NOTHING;

-- Get the venues category id for inserting business listings
DO $$
DECLARE
  venues_category_id uuid;
  admin_user_id uuid;
BEGIN
  -- Get the venues category id
  SELECT id INTO venues_category_id FROM categories WHERE slug = 'venues';
  
  -- Get an admin user id (or first user) for ownership
  SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, create a placeholder (this shouldn't happen in production)
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users. Please ensure users exist before adding business listings.';
    RETURN;
  END IF;
  
  -- Insert Cresta Lodge Harare
  INSERT INTO business_listings (
    business_name,
    category_id,
    location,
    address,
    description,
    email,
    phone_number,
    website,
    images,
    featured,
    status,
    user_id,
    capacity_min,
    capacity_max,
    price_from,
    price_unit,
    amenities
  ) VALUES (
    'Cresta Lodge Harare',
    venues_category_id,
    'Harare',
    'Cresta Lodge, Msasa, Harare, Zimbabwe',
    'Premier hotel and conference facility in Harare offering elegant event spaces, comfortable accommodation, and professional service for weddings, conferences, and corporate events. Features modern amenities and beautiful outdoor gardens.',
    'info@crestalodge.co.zw',
    '+263 24 2487561',
    'https://www.crestalodge.co.zw',
    ARRAY['/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png'],
    true,
    'approved',
    admin_user_id,
    50,
    200,
    150.00,
    'per person',
    ARRAY['Conference Rooms', 'Wedding Venue', 'Accommodation', 'Catering', 'Audio/Visual Equipment', 'Outdoor Gardens', 'Parking', 'WiFi']
  ) ON CONFLICT DO NOTHING;
  
  -- Insert Meikles Hotel
  INSERT INTO business_listings (
    business_name,
    category_id,
    location,
    address,
    description,
    email,
    phone_number,
    website,
    images,
    featured,
    status,
    user_id,
    capacity_min,
    capacity_max,
    price_from,
    price_unit,
    amenities
  ) VALUES (
    'Meikles Hotel',
    venues_category_id,
    'Central Harare',
    'Jason Moyo Avenue, Central Harare, Zimbabwe',
    'Zimbabwe''s most iconic luxury hotel in the heart of Harare. Offering world-class facilities for weddings, conferences, and special events. Known for exceptional service, elegant ballrooms, and premium dining experiences.',
    'reservations@meikles.com',
    '+263 24 2707721',
    'https://www.meikles.com',
    ARRAY['/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png'],
    true,
    'approved',
    admin_user_id,
    100,
    500,
    200.00,
    'per person',
    ARRAY['Grand Ballroom', 'Multiple Conference Rooms', 'Luxury Accommodation', 'Fine Dining', 'Spa', 'Fitness Center', 'Business Center', 'Valet Parking', '24/7 Concierge']
  ) ON CONFLICT DO NOTHING;
  
  -- Insert Rainbow Towers Hotel
  INSERT INTO business_listings (
    business_name,
    category_id,
    location,
    address,
    description,
    email,
    phone_number,
    website,
    images,
    featured,
    status,
    user_id,
    capacity_min,
    capacity_max,
    price_from,
    price_unit,
    amenities
  ) VALUES (
    'Rainbow Towers Hotel',
    venues_category_id,
    'Harare',
    'Rainbow Towers, Harare, Zimbabwe',
    'Modern hotel and events venue offering versatile spaces for conferences, weddings, and social gatherings. Features contemporary facilities, professional event coordination, and excellent catering services.',
    'events@rainbowtowers.co.zw',
    '+263 24 2750751',
    'https://www.rainbowtowers.co.zw',
    ARRAY['/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png'],
    true,
    'approved',
    admin_user_id,
    80,
    300,
    120.00,
    'per person',
    ARRAY['Conference Facilities', 'Wedding Venue', 'Hotel Rooms', 'Restaurant', 'Bar', 'Event Coordination', 'Catering Services', 'Parking', 'WiFi']
  ) ON CONFLICT DO NOTHING;
  
  -- Insert Royal Gardens Wedding Venue
  INSERT INTO business_listings (
    business_name,
    category_id,
    location,
    address,
    description,
    email,
    phone_number,
    website,
    images,
    featured,
    status,
    user_id,
    capacity_min,
    capacity_max,
    price_from,
    price_unit,
    amenities
  ) VALUES (
    'Royal Gardens Wedding Venue',
    venues_category_id,
    'Harare',
    'Royal Gardens, Borrowdale, Harare, Zimbabwe',
    'Exclusive wedding and events venue featuring stunning gardens, elegant reception halls, and personalized service. Specializing in creating unforgettable wedding experiences with beautiful outdoor and indoor spaces.',
    'info@royalgardens.co.zw',
    '+263 77 123 4567',
    'https://www.royalgardens.co.zw',
    ARRAY['https://images.unsplash.com/photo-1519167758481-83f29da8ee31?w=800'],
    true,
    'approved',
    admin_user_id,
    100,
    400,
    180.00,
    'per person',
    ARRAY['Garden Ceremony', 'Reception Hall', 'Bridal Suite', 'Photography Areas', 'Catering Kitchen', 'Dance Floor', 'Bar Service', 'Parking', 'Wedding Coordination']
  ) ON CONFLICT DO NOTHING;
  
END $$;