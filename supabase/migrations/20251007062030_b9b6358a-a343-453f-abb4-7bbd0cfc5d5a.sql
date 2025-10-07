-- Insert sample organizers, venues, and events
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Try to get the first existing user
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, use a placeholder UUID
  IF sample_user_id IS NULL THEN
    sample_user_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- Insert sample organizers
  INSERT INTO public.organizers (user_id, business_type, business_name, email, phone_number, description, city, country, status, is_verified)
  VALUES
    (sample_user_id, 'event_organizer', 'Elite Events Zimbabwe', 'contact@eliteevents.co.zw', '+263 77 123 4567', 'Premium event planning and management services in Harare', 'Harare', 'Zimbabwe', 'approved', true),
    (sample_user_id, 'venue_operator', 'Rainbow Venues', 'info@rainbowvenues.co.zw', '+263 77 234 5678', 'Luxurious wedding and conference venues across Zimbabwe', 'Harare', 'Zimbabwe', 'approved', true),
    (sample_user_id, 'transport_operator', 'SafeRide Transport', 'bookings@saferide.co.zw', '+263 77 345 6789', 'Reliable event transportation and shuttle services', 'Bulawayo', 'Zimbabwe', 'approved', true),
    (sample_user_id, 'event_organizer', 'Victoria Falls Events Co', 'hello@vicfallsevents.com', '+263 77 456 7890', 'Spectacular events at Africa''s adventure capital', 'Victoria Falls', 'Zimbabwe', 'approved', true),
    (sample_user_id, 'venue_operator', 'Mutare Conference Centre', 'info@mutarecc.co.zw', '+263 77 567 8901', 'Modern conference and event facilities in the Eastern Highlands', 'Mutare', 'Zimbabwe', 'approved', true);

  -- Insert sample venues
  INSERT INTO public.venues (organizer_id, name, venue_type, description, address, city, country, capacity, latitude, longitude, amenities, accessibility_features, contact_phone, contact_email, is_active)
  SELECT 
    o.id, v.name, v.venue_type, v.description, v.address, v.city, v.country, v.capacity, v.latitude, v.longitude, v.amenities, v.accessibility_features, v.contact_phone, v.contact_email, v.is_active
  FROM public.organizers o
  CROSS JOIN (VALUES
      ('Rainbow Venues', 'Royal Gardens Wedding Venue', 'wedding_venue', 'Elegant outdoor garden venue perfect for weddings and celebrations', '45 Borrowdale Road', 'Harare', 'Zimbabwe', 500, -17.7833, 31.0500, ARRAY['Parking', 'Catering Kitchen', 'Bridal Suite', 'Garden', 'WiFi'], ARRAY['Wheelchair Access', 'Accessible Parking'], '+263 77 234 5678', 'royalgardens@rainbowvenues.co.zw', true),
      ('Rainbow Venues', 'Meikles Hotel Conference Centre', 'conference_venue', 'Historic luxury hotel with state-of-the-art conference facilities', 'Jason Moyo Avenue', 'Harare', 'Zimbabwe', 800, -17.8292, 31.0522, ARRAY['WiFi', 'Projector', 'Sound System', 'Catering', 'Parking', 'Air Conditioning'], ARRAY['Wheelchair Access', 'Elevator'], '+263 77 234 5679', 'conferences@meikles.co.zw', true),
      ('Mutare Conference Centre', 'Leopard Rock Convention Hall', 'conference_venue', 'Scenic mountain venue with panoramic views', 'Vumba Road', 'Mutare', 'Zimbabwe', 300, -18.9667, 32.6500, ARRAY['WiFi', 'Projector', 'Sound System', 'Restaurant', 'Accommodation'], ARRAY['Wheelchair Access'], '+263 77 567 8901', 'convention@leopardrock.co.zw', true),
      ('Victoria Falls Events Co', 'Victoria Falls Safari Lodge Arena', 'outdoor_venue', 'Breathtaking outdoor venue overlooking the Zambezi National Park', 'Squire Cummings Road', 'Victoria Falls', 'Zimbabwe', 1000, -17.9167, 25.8167, ARRAY['Outdoor Stage', 'Sound System', 'Lighting', 'Bar', 'Catering', 'Parking'], ARRAY['Accessible Parking'], '+263 77 456 7890', 'events@vfsafari.com', true),
      ('Elite Events Zimbabwe', 'Harare Sports Club', 'sports_venue', 'Premier sports and events venue in the heart of Harare', 'Josiah Chinamano Avenue', 'Harare', 'Zimbabwe', 10000, -17.8311, 31.0444, ARRAY['Parking', 'Food Vendors', 'VIP Lounge', 'Security'], ARRAY['Wheelchair Access', 'Accessible Seating'], '+263 77 123 4567', 'bookings@hararesports.co.zw', true),
      ('Elite Events Zimbabwe', 'The Boma Zimbabwe', 'restaurant_venue', 'Authentic cultural dining and entertainment venue', '16 Park Way', 'Victoria Falls', 'Zimbabwe', 200, -17.9242, 25.8561, ARRAY['Restaurant', 'Bar', 'Traditional Entertainment', 'Outdoor Seating'], ARRAY['Wheelchair Access'], '+263 77 123 4568', 'bookings@theboma.co.zw', true),
      ('Rainbow Venues', 'Cresta Lodge Harare', 'hotel_conference', 'Modern hotel with flexible event spaces', 'Samora Machel Avenue', 'Harare', 'Zimbabwe', 400, -17.8206, 31.0525, ARRAY['WiFi', 'Projector', 'Catering', 'Accommodation', 'Pool', 'Gym'], ARRAY['Wheelchair Access', 'Elevator', 'Accessible Rooms'], '+263 77 234 5680', 'events@cresta.co.zw', true)
  ) AS v(organizer_name, name, venue_type, description, address, city, country, capacity, latitude, longitude, amenities, accessibility_features, contact_phone, contact_email, is_active)
  WHERE o.business_name = v.organizer_name;

  -- Insert sample events
  INSERT INTO public.events (organizer_id, venue_id, title, description, event_category, start_datetime, end_datetime, is_published, is_featured, timezone, images, max_tickets_per_order, sales_start_datetime, sales_end_datetime)
  SELECT 
    o.id, v.id, e.title, e.description, e.event_category::event_category, e.start_datetime::timestamptz, e.end_datetime::timestamptz, e.is_published, e.is_featured, e.timezone, e.images, e.max_tickets_per_order, e.sales_start_datetime::timestamptz, e.sales_end_datetime::timestamptz
  FROM public.organizers o
  CROSS JOIN public.venues v
  CROSS JOIN (VALUES
      ('Elite Events Zimbabwe', 'Harare Sports Club', 'Harare International Music Festival 2025', 'Three-day celebration of African music featuring top artists from across the continent', 'concert', '2025-11-15 16:00:00+02', '2025-11-17 23:00:00+02', true, true, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819'], 8, '2025-10-01 00:00:00+02', '2025-11-15 12:00:00+02'),
      ('Victoria Falls Events Co', 'Victoria Falls Safari Lodge Arena', 'Victoria Falls Adventure Sports Expo', 'Adrenaline-packed expo showcasing adventure activities and extreme sports', 'sports', '2025-12-05 09:00:00+02', '2025-12-07 18:00:00+02', true, true, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'], 6, '2025-10-15 00:00:00+02', '2025-12-04 23:59:00+02'),
      ('Elite Events Zimbabwe', 'Meikles Hotel Conference Centre', 'Zimbabwe Tech Summit 2025', 'Annual technology and innovation conference bringing together tech leaders and startups', 'conference', '2025-11-20 08:00:00+02', '2025-11-22 17:00:00+02', true, true, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87'], 4, '2025-09-20 00:00:00+02', '2025-11-19 23:59:00+02'),
      ('Rainbow Venues', 'Royal Gardens Wedding Venue', 'Summer Wedding Showcase', 'Exclusive showcase featuring top wedding vendors and venue tours', 'festival', '2025-10-25 10:00:00+02', '2025-10-25 16:00:00+02', true, false, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed'], 10, '2025-10-01 00:00:00+02', '2025-10-24 23:59:00+02'),
      ('Victoria Falls Events Co', 'The Boma Zimbabwe', 'Traditional Cuisine & Culture Night', 'Immersive cultural experience with traditional food, music, and dance', 'restaurant', '2025-11-30 18:00:00+02', '2025-11-30 23:00:00+02', true, false, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1533777857889-4be7c70b33f7'], 6, '2025-10-30 00:00:00+02', '2025-11-30 12:00:00+02'),
      ('Mutare Conference Centre', 'Leopard Rock Convention Hall', 'Eastern Highlands Business Forum', 'Regional business networking and development forum', 'conference', '2025-12-10 08:30:00+02', '2025-12-11 17:00:00+02', true, false, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622'], 4, '2025-11-01 00:00:00+02', '2025-12-09 23:59:00+02'),
      ('Elite Events Zimbabwe', 'Cresta Lodge Harare', 'New Year''s Eve Gala 2025', 'Elegant black-tie gala celebration to welcome 2026', 'club_night', '2025-12-31 20:00:00+02', '2026-01-01 02:00:00+02', true, true, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1467810563316-b5476525c0f9'], 4, '2025-11-01 00:00:00+02', '2025-12-30 23:59:00+02'),
      ('Victoria Falls Events Co', 'Victoria Falls Safari Lodge Arena', 'Full Moon Safari Concert', 'Magical outdoor concert under the African full moon', 'concert', '2025-11-27 18:00:00+02', '2025-11-27 23:30:00+02', true, true, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'], 8, '2025-10-20 00:00:00+02', '2025-11-27 12:00:00+02'),
      ('Elite Events Zimbabwe', 'Harare Sports Club', 'Zimbabwe Marathon 2025', 'Annual international marathon through the streets of Harare', 'sports', '2025-10-20 06:00:00+02', '2025-10-20 14:00:00+02', true, false, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1452626038306-9aae5e071dd3'], 2, '2025-08-01 00:00:00+02', '2025-10-15 23:59:00+02'),
      ('Rainbow Venues', 'Meikles Hotel Conference Centre', 'Women in Business Leadership Summit', 'Empowering conference celebrating women entrepreneurs and business leaders', 'conference', '2025-11-08 08:00:00+02', '2025-11-08 17:00:00+02', true, true, 'Africa/Harare', ARRAY['https://images.unsplash.com/photo-1475721027785-f74eccf877e2'], 4, '2025-09-15 00:00:00+02', '2025-11-07 23:59:00+02')
  ) AS e(organizer_name, venue_name, title, description, event_category, start_datetime, end_datetime, is_published, is_featured, timezone, images, max_tickets_per_order, sales_start_datetime, sales_end_datetime)
  WHERE o.business_name = e.organizer_name AND v.name = e.venue_name;

END $$;