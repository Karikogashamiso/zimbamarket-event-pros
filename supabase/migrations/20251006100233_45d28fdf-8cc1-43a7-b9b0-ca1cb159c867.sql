-- Simply insert dummy services using existing categories
DO $$
DECLARE
  v_venues_id uuid;
  v_food_id uuid;
  v_entertainment_id uuid;
  v_media_id uuid;
BEGIN
  -- Get existing category IDs (any that exist)
  SELECT id INTO v_venues_id FROM public.categories WHERE slug IN ('venues', 'venue') LIMIT 1;
  SELECT id INTO v_food_id FROM public.categories WHERE slug IN ('food', 'catering') LIMIT 1;
  SELECT id INTO v_entertainment_id FROM public.categories WHERE slug IN ('entertainment', 'djs') LIMIT 1;
  SELECT id INTO v_media_id FROM public.categories WHERE slug IN ('media', 'photography') LIMIT 1;

  -- Only insert if we have valid category IDs
  IF v_venues_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Meikles Hotel - Grand Ballroom') THEN
    INSERT INTO public.services (
      category_id, title, description, location, address,
      price_from, price_unit, rating, review_count, capacity_min, capacity_max,
      featured, verified, active, phone_number, email, website, image_url, amenities
    ) VALUES (
      v_venues_id,
      'Meikles Hotel - Grand Ballroom',
      'Elegant 5-star hotel ballroom perfect for weddings and corporate events',
      'Harare', '61 Jason Moyo Avenue, Harare',
      2500, 'event', 4.8, 127, 50, 500, true, true, true,
      '+263 4 707 721', 'events@meikles.com', 'https://meikles.com',
      '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
      ARRAY['Air Conditioning', 'Parking', 'WiFi', 'Catering Kitchen', 'Bar', 'Stage']
    );
  END IF;

  IF v_venues_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Rainbow Towers Hotel') THEN
    INSERT INTO public.services (
      category_id, title, description, location, address,
      price_from, price_unit, rating, review_count, capacity_min, capacity_max,
      featured, verified, active, phone_number, email, website, image_url, amenities
    ) VALUES (
      v_venues_id, 'Rainbow Towers Hotel',
      'Luxurious hotel venue with panoramic city views',
      'Harare', '54-56 Park Lane, Harare',
      2000, 'event', 4.7, 98, 30, 400, true, true, true,
      '+263 4 250 555', 'events@rainbow.co.zw', 'https://rainbow.co.zw',
      '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
      ARRAY['Air Conditioning', 'Parking', 'WiFi', 'Catering', 'Bar']
    );
  END IF;

  IF v_venues_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Royal Gardens Wedding Venue') THEN
    INSERT INTO public.services (
      category_id, title, description, location,
      price_from, price_unit, rating, review_count, capacity_min, capacity_max,
      featured, verified, active, phone_number, email, image_url, amenities
    ) VALUES (
      v_venues_id, 'Royal Gardens Wedding Venue',
      'Exclusive outdoor wedding venue with lush gardens',
      'Harare', 1500, 'event', 4.9, 156, 50, 250, true, true, true,
      '+263 77 123 4567', 'info@royalgardens.co.zw',
      '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
      ARRAY['Garden', 'Gazebo', 'Parking', 'Catering Kitchen']
    );
  END IF;

  IF v_food_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Elite Catering Services') THEN
    INSERT INTO public.services (
      category_id, title, description, location,
      price_from, price_unit, rating, review_count, featured, verified, active,
      phone_number, email, image_url, amenities
    ) VALUES (
      v_food_id, 'Elite Catering Services',
      'Premium catering for weddings and corporate events',
      'Harare', 25, 'per person', 4.8, 94, true, true, true,
      '+263 77 234 5678', 'info@elitecatering.co.zw',
      '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png',
      ARRAY['Custom Menus', 'Dietary Options', 'Setup & Cleanup']
    );
  END IF;

  IF v_entertainment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'DJ Elite Beats') THEN
    INSERT INTO public.services (
      category_id, title, description, location,
      price_from, price_unit, rating, review_count, featured, verified, active,
      phone_number, email, image_url, amenities
    ) VALUES (
      v_entertainment_id, 'DJ Elite Beats',
      'Professional DJ services for all events',
      'Harare', 500, 'event', 4.9, 142, true, true, true,
      '+263 77 456 7890', 'bookings@elitebeats.co.zw',
      '/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png',
      ARRAY['Professional Equipment', 'Music Library', 'Lighting']
    );
  END IF;

  IF v_media_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Moments Photography Studio') THEN
    INSERT INTO public.services (
      category_id, title, description, location,
      price_from, price_unit, rating, review_count, featured, verified, active,
      phone_number, email, website, image_url, amenities
    ) VALUES (
      v_media_id, 'Moments Photography Studio',
      'Professional wedding and event photography',
      'Harare', 800, 'event', 4.9, 167, true, true, true,
      '+263 77 678 9012', 'bookings@momentsphotography.co.zw',
      'https://momentsphotography.co.zw',
      '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png',
      ARRAY['Digital Photos', 'Photo Album', 'Online Gallery', 'Drone Photography']
    );
  END IF;

END $$;