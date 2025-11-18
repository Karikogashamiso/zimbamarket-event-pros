-- Create a test event for payment gateway testing
INSERT INTO events (
  title,
  slug,
  description,
  start_datetime,
  end_datetime,
  venue_id,
  organizer_id,
  event_category,
  is_published,
  is_featured,
  featured_image,
  max_tickets_per_order,
  timezone
) VALUES (
  'Payment Gateway Test Concert',
  'payment-test-concert-2025',
  'Test event for payment gateway integration testing. This concert features multiple ticket tiers to test different payment scenarios including ContiPay and Stripe.',
  '2025-12-15 18:00:00+00',
  '2025-12-15 23:00:00+00',
  (SELECT id FROM venues WHERE name = 'Harare Sports Club' LIMIT 1),
  (SELECT id FROM organizers WHERE business_name = 'Elite Events Zimbabwe' LIMIT 1),
  'concert',
  true,
  true,
  '/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png',
  10,
  'Africa/Harare'
);

-- Get the event id for inserting ticket types
DO $$
DECLARE
  test_event_id uuid;
BEGIN
  SELECT id INTO test_event_id FROM events WHERE slug = 'payment-test-concert-2025';
  
  -- Insert VIP Ticket Type
  INSERT INTO ticket_types (
    event_id,
    name,
    description,
    base_price,
    currency,
    max_quantity,
    max_per_order,
    is_active,
    is_refundable,
    sort_order,
    includes_benefits
  ) VALUES (
    test_event_id,
    'VIP Pass',
    'Premium access with backstage meet & greet, complimentary drinks, and VIP seating area',
    150.00,
    'USD',
    50,
    5,
    true,
    true,
    1,
    ARRAY['Backstage access', 'Meet & greet', 'Complimentary drinks', 'VIP seating']
  );
  
  -- Insert General Admission Ticket
  INSERT INTO ticket_types (
    event_id,
    name,
    description,
    base_price,
    currency,
    max_quantity,
    max_per_order,
    is_active,
    is_refundable,
    sort_order,
    includes_benefits
  ) VALUES (
    test_event_id,
    'General Admission',
    'Standard entry to the concert with access to general standing area',
    50.00,
    'USD',
    500,
    10,
    true,
    true,
    2,
    ARRAY['General standing area', 'Access to food vendors']
  );
  
  -- Insert Early Bird Ticket
  INSERT INTO ticket_types (
    event_id,
    name,
    description,
    base_price,
    currency,
    max_quantity,
    max_per_order,
    is_active,
    is_refundable,
    sort_order,
    includes_benefits,
    early_bird_price,
    early_bird_end_datetime
  ) VALUES (
    test_event_id,
    'Early Bird Special',
    'Limited early bird tickets at discounted price - First come first served!',
    75.00,
    'USD',
    100,
    6,
    true,
    false,
    0,
    ARRAY['Priority entry', 'General seating', 'Event merchandise discount'],
    45.00,
    '2025-11-30 23:59:59+00'
  );
  
  -- Insert Student Ticket
  INSERT INTO ticket_types (
    event_id,
    name,
    description,
    base_price,
    currency,
    max_quantity,
    max_per_order,
    is_active,
    is_refundable,
    sort_order,
    includes_benefits
  ) VALUES (
    test_event_id,
    'Student Ticket',
    'Special discounted rate for students (valid student ID required at entry)',
    30.00,
    'USD',
    200,
    4,
    true,
    true,
    3,
    ARRAY['Student discount', 'General admission']
  );
END $$;