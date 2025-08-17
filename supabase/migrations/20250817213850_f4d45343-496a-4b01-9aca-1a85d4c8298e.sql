-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table for event service providers
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  price_from DECIMAL(10,2),
  price_unit TEXT DEFAULT 'service',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  phone_number TEXT,
  email TEXT,
  website TEXT,
  capacity_min INTEGER,
  capacity_max INTEGER,
  response_time TEXT DEFAULT 'Usually responds within 24 hours',
  availability_status TEXT DEFAULT 'Available',
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  image_url TEXT,
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service images table
CREATE TABLE public.service_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Active services are viewable by everyone" 
ON public.services FOR SELECT USING (active = true);

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Service images are viewable by everyone" 
ON public.service_images FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, description, icon, slug) VALUES
('Venues', 'Wedding halls, conference centers, outdoor spaces', 'Building2', 'venues'),
('Catering', 'Professional catering services for all occasions', 'Utensils', 'catering'),
('Bar Services', 'Professional bar and beverage services', 'Wine', 'bar'),
('DJ & Music', 'Professional DJs and music entertainment', 'Music', 'dj'),
('Entertainment', 'Event entertainers and performers', 'Users2', 'entertainers'),
('Flowers & Decor', 'Floral arrangements and event decoration', 'Flower', 'flowers'),
('Decor', 'Event decoration and styling services', 'Palette', 'decor'),
('Photography', 'Professional event photography services', 'Camera', 'photography'),
('Videography', 'Professional event videography services', 'Video', 'videography'),
('Bakery', 'Custom cakes and desserts', 'Cake', 'bakers'),
('Musicians', 'Live music and musical performances', 'Piano', 'musicians'),
('Event Planning', 'Professional event planning and coordination', 'UserCheck', 'event-planners'),
('Beauty Services', 'Hair, makeup and beauty services', 'Scissors', 'beauty'),
('Speakers', 'Professional speakers and presenters', 'Mic', 'speakers'),
('Security', 'Event security and safety services', 'Shield', 'security'),
('Bands', 'Live bands and musical groups', 'Guitar', 'bands'),
('Lighting', 'Professional event lighting services', 'Lightbulb', 'lighting'),
('Sound Systems', 'Audio and sound equipment services', 'Speaker', 'sound'),
('Photo Booths', 'Photo booth rental and services', 'Image', 'photo-booths'),
('Private Chefs', 'Personal chef and cooking services', 'ChefHat', 'private-chefs'),
('Food Stands', 'Food truck and stand services', 'ShoppingBag', 'food-stands'),
('Officiants', 'Wedding and ceremony officiants', 'Heart', 'officiants');

-- Insert sample services
INSERT INTO public.services (title, description, full_description, category_id, location, address, price_from, rating, review_count, phone_number, email, capacity_min, capacity_max, featured, verified, image_url, amenities) 
VALUES
(
  'Royal Gardens Wedding Venue',
  'Elegant garden venue perfect for weddings with capacity for 200 guests. Features beautiful outdoor ceremony space and covered reception hall.',
  'Royal Gardens Wedding Venue is an exquisite destination that combines sophistication with natural beauty. Our venue features multiple ceremony locations, from intimate garden settings to grand outdoor pavilions. The main reception hall can accommodate up to 200 guests and features floor-to-ceiling windows that flood the space with natural light during the day and offer romantic ambiance in the evening. Our professional team handles every detail, from décor setup to catering coordination, ensuring your wedding day is flawless.',
  (SELECT id FROM public.categories WHERE slug = 'venues'),
  'Harare, Zimbabwe',
  '123 Garden Avenue, Highlands, Harare',
  500.00,
  4.9,
  127,
  '263 77 440 9989',
  'info@royalgardens.co.zw',
  50,
  200,
  true,
  true,
  '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
  ARRAY['Bridal Suite', 'Parking for 100+ cars', 'Professional Lighting', 'Sound System', 'Catering Kitchen', 'Garden Ceremony Space', 'Reception Hall', 'Photography Areas']
),
(
  'Premium African Cuisine Catering',
  'Authentic Zimbabwean cuisine with modern presentation. Specializing in traditional dishes and international fusion for events of all sizes.',
  'Our catering service brings the rich flavors of Zimbabwe to your special event. We specialize in traditional Zimbabwean dishes prepared with modern techniques and beautiful presentation. From sadza and nyama to international fusion cuisine, we cater to all tastes and dietary requirements. Our experienced chefs use only the finest local ingredients to create memorable dining experiences.',
  (SELECT id FROM public.categories WHERE slug = 'catering'),
  'Bulawayo, Zimbabwe',
  '456 Food Street, Bulawayo',
  25.00,
  4.8,
  89,
  '263 77 440 9989',
  'info@premiumcatering.co.zw',
  20,
  500,
  false,
  true,
  '/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png',
  ARRAY['Professional Kitchen', 'Catering Equipment', 'Serving Staff', 'Dietary Accommodations', 'Table Service', 'Buffet Setup']
),
(
  'EliteBeats DJ Services',
  'Professional DJ services with state-of-the-art sound systems. Specializing in weddings, corporate events, and private parties.',
  'EliteBeats brings the party to life with professional DJ services and cutting-edge sound equipment. Our experienced DJs read the crowd and keep the dance floor packed all night long. We offer extensive music libraries covering all genres and decades, plus professional lighting and MC services. From intimate gatherings to large celebrations, we have the equipment and expertise to make your event unforgettable.',
  (SELECT id FROM public.categories WHERE slug = 'dj'),
  'Victoria Falls, Zimbabwe',
  '789 Music Avenue, Victoria Falls',
  200.00,
  5.0,
  156,
  '263 77 440 9989',
  'info@elitebeats.co.zw',
  10,
  1000,
  true,
  true,
  '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png',
  ARRAY['Professional Sound System', 'Lighting Equipment', 'Wireless Microphones', 'DJ Booth', 'Music Library', 'MC Services']
);

-- Insert sample reviews
INSERT INTO public.reviews (service_id, reviewer_name, rating, comment, helpful_count) VALUES
(
  (SELECT id FROM public.services WHERE title = 'Royal Gardens Wedding Venue'),
  'Sarah M.',
  5,
  'Absolutely magical venue! The gardens are breathtaking and the staff went above and beyond to make our wedding day perfect. Highly recommend!',
  12
),
(
  (SELECT id FROM public.services WHERE title = 'Royal Gardens Wedding Venue'),
  'David & Jane K.',
  5,
  'Royal Gardens exceeded all our expectations. The venue is stunning, the service is impeccable, and our guests are still talking about how beautiful everything was.',
  8
),
(
  (SELECT id FROM public.services WHERE title = 'Premium African Cuisine Catering'),
  'Michael T.',
  4,
  'Great catering service with authentic flavors. The presentation was beautiful and guests loved the traditional dishes. Will definitely use again.',
  5
),
(
  (SELECT id FROM public.services WHERE title = 'EliteBeats DJ Services'),
  'Lisa P.',
  5,
  'Amazing DJ service! They kept everyone dancing all night and were very professional. The sound quality was perfect and they took all our requests.',
  15
);

-- Create indexes for better performance
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_location ON public.services(location);
CREATE INDEX idx_services_featured ON public.services(featured);
CREATE INDEX idx_services_active ON public.services(active);
CREATE INDEX idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX idx_service_images_service_id ON public.service_images(service_id);