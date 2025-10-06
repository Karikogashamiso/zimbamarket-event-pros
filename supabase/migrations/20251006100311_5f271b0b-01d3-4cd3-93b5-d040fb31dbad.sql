-- Simply add dummy services to existing categories
DO $$
DECLARE
  v_category_id uuid;
BEGIN
  -- Add venue services
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'venues' OR name ILIKE '%venue%' LIMIT 1;
  
  IF v_category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Meikles Hotel - Grand Ballroom') THEN
    INSERT INTO public.services (
      category_id, title, description, location, price_from, price_unit,
      rating, review_count, capacity_min, capacity_max, featured, verified, active,
      phone_number, email, website, image_url, amenities
    ) VALUES (
      v_category_id, 'Meikles Hotel - Grand Ballroom',
      'Elegant 5-star hotel ballroom perfect for weddings and corporate events',
      'Harare', 2500, 'event', 4.8, 127, 50, 500, true, true, true,
      '+263 4 707 721', 'events@meikles.com', 'https://meikles.com',
      '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
      ARRAY['Air Conditioning', 'Parking', 'WiFi']
    );
  END IF;

  IF v_category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Rainbow Towers Hotel') THEN
    INSERT INTO public.services (
      category_id, title, description, location, price_from, price_unit,
      rating, review_count, capacity_min, capacity_max, featured, verified, active,
      phone_number, email, image_url, amenities
    ) VALUES (
      v_category_id, 'Rainbow Towers Hotel',
      'Luxurious hotel venue with panoramic city views',
      'Harare', 2000, 'event', 4.7, 98, 30, 400, true, true, true,
      '+263 4 250 555', 'events@rainbow.co.zw',
      '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
      ARRAY['Air Conditioning', 'Parking', 'WiFi']
    );
  END IF;

  -- Add entertainment services
  SELECT id INTO v_category_id FROM public.categories WHERE slug IN ('entertainment', 'media') OR name ILIKE '%entertainment%' LIMIT 1;
  
  IF v_category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'DJ Elite Beats') THEN
    INSERT INTO public.services (
      category_id, title, description, location, price_from, price_unit,
      rating, review_count, featured, verified, active, phone_number, email,
      image_url, amenities
    ) VALUES (
      v_category_id, 'DJ Elite Beats',
      'Professional DJ services for all events',
      'Harare', 500, 'event', 4.9, 142, true, true, true,
      '+263 77 456 7890', 'bookings@elitebeats.co.zw',
      '/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png',
      ARRAY['Professional Equipment', 'Music Library', 'Lighting']
    );
  END IF;

  -- Add photographer
  SELECT id INTO v_category_id FROM public.categories WHERE slug IN ('media', 'photography') OR name ILIKE '%photo%' LIMIT 1;
  
  IF v_category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Moments Photography Studio') THEN
    INSERT INTO public.services (
      category_id, title, description, location, price_from, price_unit,
      rating, review_count, featured, verified, active, phone_number, email,
      website, image_url, amenities
    ) VALUES (
      v_category_id, 'Moments Photography Studio',
      'Professional wedding and event photography',
      'Harare', 800, 'event', 4.9, 167, true, true, true,
      '+263 77 678 9012', 'bookings@momentsphotography.co.zw',
      'https://momentsphotography.co.zw',
      '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png',
      ARRAY['Digital Photos', 'Photo Album', 'Drone Photography']
    );
  END IF;

  -- Add catering
  SELECT id INTO v_category_id FROM public.categories WHERE slug IN ('food', 'catering') OR name ILIKE '%food%' OR name ILIKE '%cater%' LIMIT 1;
  
  IF v_category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Elite Catering Services') THEN
    INSERT INTO public.services (
      category_id, title, description, location, price_from, price_unit,
      rating, review_count, featured, verified, active, phone_number, email,
      image_url, amenities
    ) VALUES (
      v_category_id, 'Elite Catering Services',
      'Premium catering for weddings and corporate events',
      'Harare', 25, 'per person', 4.8, 94, true, true, true,
      '+263 77 234 5678', 'info@elitecatering.co.zw',
      '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png',
      ARRAY['Custom Menus', 'Dietary Options']
    );
  END IF;

END $$;