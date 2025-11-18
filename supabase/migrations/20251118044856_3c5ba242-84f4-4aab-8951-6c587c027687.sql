-- Add services for Cresta Lodge Harare
INSERT INTO services (
  title, description, full_description, category_id, location, address,
  price_from, price_unit, phone_number, email, website,
  capacity_min, capacity_max, amenities, image_url, images,
  business_listing_id, active, is_featured, is_verified
) VALUES
(
  'Conference & Meeting Facilities',
  'Professional conference rooms with modern audio-visual equipment, ideal for business meetings, seminars, and corporate events.',
  'Cresta Lodge offers versatile conference facilities equipped with state-of-the-art technology. Our meeting rooms can accommodate various group sizes and are perfect for business meetings, training sessions, product launches, and corporate seminars. Professional event coordination and catering services available.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Harare',
  'Cresta Lodge, 10 Borrowdale Road, Msasa, Harare, Zimbabwe',
  100.00,
  'per person',
  '+263 24 2487561',
  'info@crestalodge.co.zw',
  'https://www.crestalodge.co.zw',
  10,
  100,
  ARRAY['Projector & Screen', 'WiFi', 'Air Conditioning', 'Catering Available', 'Audio System', 'Whiteboard', 'Parking', 'Tea/Coffee Service'],
  '/cresta-lodge-harare.jpg',
  ARRAY['/cresta-lodge-harare.jpg'],
  '0b6fe618-a8ac-42e4-8dea-e4b9fe50cfe1',
  true,
  true,
  true
),
(
  'Wedding Venue & Reception',
  'Elegant wedding venue with beautiful outdoor gardens and sophisticated indoor reception halls for your special day.',
  'Create unforgettable memories at Cresta Lodge with our comprehensive wedding packages. Our venue features beautiful outdoor gardens perfect for ceremonies, complemented by elegant indoor reception areas. We offer complete wedding coordination, professional catering, and customizable decor options to bring your dream wedding to life.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Harare',
  'Cresta Lodge, 10 Borrowdale Road, Msasa, Harare, Zimbabwe',
  150.00,
  'per person',
  '+263 24 2487561',
  'info@crestalodge.co.zw',
  'https://www.crestalodge.co.zw',
  50,
  200,
  ARRAY['Garden Ceremony Area', 'Indoor Reception Hall', 'Bridal Suite', 'Catering Services', 'Bar Service', 'Dance Floor', 'Sound System', 'Wedding Coordinator', 'Parking'],
  '/cresta-lodge-harare.jpg',
  ARRAY['/cresta-lodge-harare.jpg'],
  '0b6fe618-a8ac-42e4-8dea-e4b9fe50cfe1',
  true,
  true,
  true
);

-- Add services for Meikles Hotel
INSERT INTO services (
  title, description, full_description, category_id, location, address,
  price_from, price_unit, phone_number, email, website,
  capacity_min, capacity_max, amenities, image_url, images,
  business_listing_id, active, is_featured, is_verified
) VALUES
(
  'Grand Ballroom Weddings',
  'Zimbabwe''s most prestigious wedding venue featuring the iconic Grand Ballroom with world-class service and elegant decor.',
  'Host your dream wedding in the legendary Meikles Hotel Grand Ballroom. This iconic venue offers unmatched elegance, exceptional service, and exquisite catering. Our experienced wedding team will ensure every detail is perfect, from the ceremony to the reception. Includes access to luxury bridal suites, professional event coordination, and premium dining experiences.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Central Harare',
  'Jason Moyo Avenue & Third Street, Central Harare, Zimbabwe',
  250.00,
  'per person',
  '+263 24 2707721',
  'reservations@meikles.com',
  'https://www.meikles.com',
  100,
  500,
  ARRAY['Grand Ballroom', 'Luxury Bridal Suite', 'Professional Coordination', 'Premium Catering', 'Full Bar Service', 'Dance Floor', 'Professional Lighting', 'Valet Parking', 'Accommodation Packages'],
  '/meikles-hotel.jpg',
  ARRAY['/meikles-hotel.jpg'],
  'e289e114-52aa-4b47-95f7-c7ec68734931',
  true,
  true,
  true
),
(
  'Executive Conference Services',
  'Premium conference facilities for high-level corporate events, board meetings, and international conferences.',
  'Meikles Hotel offers Zimbabwe''s finest conference facilities for discerning corporate clients. Our versatile spaces accommodate everything from intimate board meetings to large-scale international conferences. Features include cutting-edge audio-visual technology, high-speed internet, professional catering, and dedicated conference coordinators. Perfect for product launches, AGMs, and executive retreats.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Central Harare',
  'Jason Moyo Avenue & Third Street, Central Harare, Zimbabwe',
  180.00,
  'per person',
  '+263 24 2707721',
  'reservations@meikles.com',
  'https://www.meikles.com',
  10,
  300,
  ARRAY['Multiple Conference Rooms', 'Business Center', 'High-Speed WiFi', 'Audio-Visual Equipment', 'Simultaneous Translation', 'Professional Catering', 'Break-out Rooms', '24/7 Support', 'Accommodation Available'],
  '/meikles-hotel.jpg',
  ARRAY['/meikles-hotel.jpg'],
  'e289e114-52aa-4b47-95f7-c7ec68734931',
  true,
  true,
  true
);

-- Add services for Rainbow Towers Hotel
INSERT INTO services (
  title, description, full_description, category_id, location, address,
  price_from, price_unit, phone_number, email, website,
  capacity_min, capacity_max, amenities, image_url, images,
  business_listing_id, active, is_featured, is_verified
) VALUES
(
  'Modern Conference Facilities',
  'Contemporary conference spaces with flexible layouts, perfect for business meetings, workshops, and corporate training.',
  'Rainbow Towers offers modern, versatile conference facilities designed for today''s business needs. Our spaces feature contemporary design, flexible room configurations, and the latest technology. Ideal for business meetings, training workshops, seminars, and corporate events. Professional event management and comprehensive catering services included.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Harare',
  'Rainbow Towers, Harare, Zimbabwe',
  110.00,
  'per person',
  '+263 24 2750751',
  'events@rainbowtowers.co.zw',
  'https://www.rainbowtowers.co.zw',
  20,
  200,
  ARRAY['Conference Rooms', 'WiFi', 'Projector & Screen', 'Air Conditioning', 'Catering Services', 'Bar & Lounge', 'Parking', 'Accommodation Packages'],
  '/rainbow-towers-hotel.jpg',
  ARRAY['/rainbow-towers-hotel.jpg'],
  '16b509bc-acc3-4bd3-b45a-957eb3d2d9f8',
  true,
  true,
  true
),
(
  'Wedding & Reception Packages',
  'Complete wedding packages with modern amenities, professional coordination, and excellent catering for your celebration.',
  'Celebrate your special day at Rainbow Towers with our comprehensive wedding packages. We offer modern facilities, professional wedding coordination, and exceptional catering services. Our team will work with you to create a memorable event tailored to your vision, from intimate gatherings to grand celebrations. Hotel accommodation available for guests.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Harare',
  'Rainbow Towers, Harare, Zimbabwe',
  130.00,
  'per person',
  '+263 24 2750751',
  'events@rainbowtowers.co.zw',
  'https://www.rainbowtowers.co.zw',
  80,
  300,
  ARRAY['Wedding Venue', 'Reception Hall', 'Professional Coordination', 'Full Catering', 'Bar Service', 'Sound & Lighting', 'Dance Floor', 'Hotel Accommodation', 'Parking'],
  '/rainbow-towers-hotel.jpg',
  ARRAY['/rainbow-towers-hotel.jpg'],
  '16b509bc-acc3-4bd3-b45a-957eb3d2d9f8',
  true,
  true,
  true
);

-- Add services for Royal Gardens Wedding Venue
INSERT INTO services (
  title, description, full_description, category_id, location, address,
  price_from, price_unit, phone_number, email, website,
  capacity_min, capacity_max, amenities, image_url, images,
  business_listing_id, active, is_featured, is_verified
) VALUES
(
  'Garden Wedding Ceremony & Reception',
  'Stunning outdoor garden wedding venue with elegant reception facilities, perfect for creating magical wedding memories.',
  'Royal Gardens specializes in creating unforgettable outdoor wedding experiences. Our beautiful gardens provide a picturesque backdrop for your ceremony, while our elegant reception hall offers comfort and style. Complete wedding coordination services ensure every detail is perfect, from the ceremony to the last dance. Customizable packages available.',
  'a3ffabe8-5956-4352-b5be-dff762731d7a', -- venues category
  'Harare',
  'Royal Gardens, Borrowdale Road, Borrowdale, Harare, Zimbabwe',
  170.00,
  'per person',
  '+263 77 123 4567',
  'info@royalgardens.co.zw',
  'https://www.royalgardens.co.zw',
  100,
  400,
  ARRAY['Garden Ceremony Area', 'Reception Hall', 'Bridal Suite', 'Multiple Photography Spots', 'Professional Catering', 'Dance Floor', 'Full Bar Service', 'Sound System', 'Wedding Coordination', 'Ample Parking'],
  '/royal-gardens-wedding-venue.jpg',
  ARRAY['/royal-gardens-wedding-venue.jpg'],
  '695162b3-2204-4746-9b55-e3ca2f3a0ad1',
  true,
  true,
  true
),
(
  'Premium Wedding Catering Services',
  'Exquisite catering packages with customizable menus, professional service, and attention to every culinary detail.',
  'Our premium catering service offers expertly crafted menus designed to delight your guests. From traditional Zimbabwean cuisine to international favorites, our chefs create memorable dining experiences. All packages include professional wait staff, table settings, and beverage service. Custom menus available to suit dietary requirements and preferences.',
  '3ea719c3-8117-474d-914a-dd6ff8cc00a3', -- catering category
  'Harare',
  'Royal Gardens, Borrowdale Road, Borrowdale, Harare, Zimbabwe',
  45.00,
  'per person',
  '+263 77 123 4567',
  'info@royalgardens.co.zw',
  'https://www.royalgardens.co.zw',
  50,
  400,
  ARRAY['Custom Menus', 'Professional Chefs', 'Wait Staff', 'Table Settings', 'Beverage Service', 'Dietary Accommodations', 'Tasting Sessions', 'Bar Service Available'],
  '/royal-gardens-wedding-venue.jpg',
  ARRAY['/royal-gardens-wedding-venue.jpg'],
  '695162b3-2204-4746-9b55-e3ca2f3a0ad1',
  true,
  false,
  true
);