-- =============================================
-- COMPREHENSIVE TICKETING SYSTEM DATABASE SCHEMA
-- Supports: Events, Clubs, Buses, Flights
-- =============================================

-- Create enums for better data integrity
CREATE TYPE public.business_type AS ENUM ('event_organizer', 'transport_operator', 'venue_operator', 'club_operator');
CREATE TYPE public.event_category AS ENUM ('concert', 'festival', 'conference', 'sports', 'theater', 'club_night', 'restaurant');
CREATE TYPE public.transport_type AS ENUM ('bus', 'flight', 'train', 'ferry');
CREATE TYPE public.seat_type AS ENUM ('standard', 'premium', 'vip', 'accessible', 'table', 'standing');
CREATE TYPE public.ticket_status AS ENUM ('valid', 'used', 'cancelled', 'refunded', 'expired');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'checked_in', 'completed');
CREATE TYPE public.refund_status AS ENUM ('pending', 'processing', 'approved', 'rejected', 'completed');
CREATE TYPE public.currency_code AS ENUM ('USD', 'ZWL', 'RTGS');

-- =============================================
-- CORE BUSINESS ENTITIES
-- =============================================

-- Organizers/Operators (Event organizers, transport companies, clubs)
CREATE TABLE public.organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Links to auth.users
    business_type public.business_type NOT NULL,
    business_name TEXT NOT NULL,
    business_registration_number TEXT,
    tax_id TEXT,
    description TEXT,
    website TEXT,
    phone_number TEXT,
    email TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Zimbabwe',
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '[]'::jsonb,
    bank_details JSONB DEFAULT '{}'::jsonb, -- Encrypted banking information
    commission_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% default commission
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT organizers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Venues (Event spaces, clubs, airports, bus stations)
CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    venue_type TEXT NOT NULL, -- 'event_venue', 'club', 'airport', 'bus_station', 'train_station'
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Zimbabwe',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    contact_phone TEXT,
    contact_email TEXT,
    website TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    accessibility_features TEXT[] DEFAULT ARRAY[]::TEXT[],
    parking_info JSONB DEFAULT '{}'::jsonb,
    public_transport_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SEAT MAPS & CAPACITY MANAGEMENT
-- =============================================

-- Reusable seat maps for venues
CREATE TABLE public.seat_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Main Hall", "VIP Section", "Upper Deck"
    description TEXT,
    total_capacity INTEGER NOT NULL,
    seat_configuration JSONB NOT NULL, -- Detailed seat layout data
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual seats/spaces within a seat map
CREATE TABLE public.seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_map_id UUID REFERENCES public.seat_maps(id) ON DELETE CASCADE,
    seat_identifier TEXT NOT NULL, -- "A1", "Table-5", "Standing-001"
    seat_type public.seat_type NOT NULL DEFAULT 'standard',
    row_name TEXT, -- "A", "VIP", "Upper"
    seat_number INTEGER,
    position_x INTEGER, -- For visual positioning
    position_y INTEGER, -- For visual positioning
    base_price_multiplier DECIMAL(3,2) DEFAULT 1.00, -- 1.5 for premium, 0.8 for standard
    is_accessible BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(seat_map_id, seat_identifier)
);

-- =============================================
-- EVENTS & EXPERIENCES
-- =============================================

-- Main events table (concerts, festivals, conferences, club nights)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id),
    seat_map_id UUID REFERENCES public.seat_maps(id),
    
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    event_category public.event_category NOT NULL,
    
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    timezone TEXT DEFAULT 'Africa/Harare',
    
    age_restriction INTEGER, -- Minimum age
    dress_code TEXT,
    special_instructions TEXT,
    
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    featured_image TEXT,
    
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    is_cancelled BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    
    max_tickets_per_order INTEGER DEFAULT 10,
    sales_start_datetime TIMESTAMPTZ,
    sales_end_datetime TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT events_dates_check CHECK (end_datetime IS NULL OR end_datetime > start_datetime),
    CONSTRAINT events_sales_dates_check CHECK (sales_end_datetime IS NULL OR sales_end_datetime > sales_start_datetime)
);

-- =============================================
-- TRANSPORT TRIPS
-- =============================================

-- Transport routes (bus routes, flight routes)
CREATE TABLE public.transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    transport_type public.transport_type NOT NULL,
    
    route_name TEXT NOT NULL, -- "Harare to Bulawayo", "JNB to HRE"
    route_code TEXT, -- "HR-BYO-001", "SA201"
    
    origin_venue_id UUID NOT NULL REFERENCES public.venues(id),
    destination_venue_id UUID NOT NULL REFERENCES public.venues(id),
    
    distance_km INTEGER,
    estimated_duration_minutes INTEGER,
    
    intermediate_stops JSONB DEFAULT '[]'::jsonb, -- Array of stop details
    
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT routes_different_venues CHECK (origin_venue_id != destination_venue_id)
);

-- Individual transport trips/schedules
CREATE TABLE public.transport_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    seat_map_id UUID REFERENCES public.seat_maps(id),
    
    trip_number TEXT, -- "HR001", "SA201"
    vehicle_identifier TEXT, -- "Bus ABC123", "Flight SA201"
    
    departure_datetime TIMESTAMPTZ NOT NULL,
    arrival_datetime TIMESTAMPTZ NOT NULL,
    
    check_in_opens_minutes INTEGER DEFAULT 60, -- Minutes before departure
    boarding_closes_minutes INTEGER DEFAULT 15, -- Minutes before departure
    
    baggage_allowance JSONB DEFAULT '{}'::jsonb,
    meal_service BOOLEAN DEFAULT false,
    
    is_cancelled BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    delay_minutes INTEGER DEFAULT 0,
    
    sales_start_datetime TIMESTAMPTZ,
    sales_end_datetime TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT trips_arrival_after_departure CHECK (arrival_datetime > departure_datetime)
);

-- =============================================
-- TICKET TYPES & PRICING
-- =============================================

-- Ticket types/tiers for events and trips
CREATE TABLE public.ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Polymorphic references (either event_id OR trip_id, not both)
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.transport_trips(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL, -- "General Admission", "VIP", "Business Class"
    description TEXT,
    
    base_price DECIMAL(10,2) NOT NULL,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    max_quantity INTEGER, -- Total available tickets of this type
    max_per_order INTEGER DEFAULT 10,
    
    -- Early bird pricing
    early_bird_price DECIMAL(10,2),
    early_bird_end_datetime TIMESTAMPTZ,
    
    -- Group pricing
    group_size_threshold INTEGER,
    group_discount_percentage DECIMAL(5,2),
    
    is_refundable BOOLEAN DEFAULT true,
    refund_policy_text TEXT,
    
    includes_benefits TEXT[] DEFAULT ARRAY[]::TEXT[], -- ["Free drink", "VIP parking"]
    
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT ticket_types_polymorphic_check CHECK (
        (event_id IS NOT NULL AND trip_id IS NULL) OR 
        (event_id IS NULL AND trip_id IS NOT NULL)
    ),
    CONSTRAINT ticket_types_price_positive CHECK (base_price > 0),
    CONSTRAINT ticket_types_early_bird_check CHECK (
        early_bird_price IS NULL OR early_bird_price < base_price
    )
);

-- =============================================
-- ORDERS & BOOKINGS
-- =============================================

-- Customer orders/bookings
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL, -- "ZEP-2024-001234"
    
    -- Customer information (can be guest or registered user)
    user_id UUID, -- References auth.users for registered users
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_first_name TEXT NOT NULL,
    customer_last_name TEXT NOT NULL,
    
    -- Financial information
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    -- Status tracking
    booking_status public.booking_status DEFAULT 'pending',
    payment_status public.payment_status DEFAULT 'pending',
    
    -- Metadata
    booking_source TEXT DEFAULT 'web', -- 'web', 'mobile', 'api', 'phone'
    referral_code TEXT,
    special_requests TEXT,
    
    -- Timestamps
    expires_at TIMESTAMPTZ, -- For pending orders
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT orders_total_calculation CHECK (total_amount = subtotal + tax_amount + service_fee),
    CONSTRAINT orders_customer_email_check CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Individual tickets within an order
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL, -- "ZEP-TKT-2024-001234-001"
    
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id),
    seat_id UUID REFERENCES public.seats(id), -- For assigned seating
    
    -- Pricing at time of purchase
    original_price DECIMAL(10,2) NOT NULL,
    paid_price DECIMAL(10,2) NOT NULL, -- After discounts
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    -- Ticket holder information (can be different from order customer)
    holder_first_name TEXT,
    holder_last_name TEXT,
    holder_email TEXT,
    holder_phone TEXT,
    
    -- Status and validation
    ticket_status public.ticket_status DEFAULT 'valid',
    qr_code_data TEXT NOT NULL, -- Encrypted ticket data
    
    -- Usage tracking
    scanned_at TIMESTAMPTZ,
    scanned_by_user_id UUID, -- Staff member who scanned
    scan_location TEXT,
    
    -- Transfer tracking
    original_holder_email TEXT,
    transferred_at TIMESTAMPTZ,
    transfer_reason TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PAYMENT PROCESSING
-- =============================================

-- Payment transactions
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'chargeback')),
    amount DECIMAL(10,2) NOT NULL,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    payment_method TEXT NOT NULL, -- 'ecocash', 'onemoney', 'visa', 'mastercard', 'cash'
    payment_provider TEXT, -- 'paynow', 'stripe', 'manual'
    
    provider_transaction_id TEXT, -- External payment ID
    provider_response JSONB DEFAULT '{}'::jsonb,
    
    status public.payment_status DEFAULT 'pending',
    
    -- Reconciliation
    settled_at TIMESTAMPTZ,
    settlement_amount DECIMAL(10,2),
    settlement_currency public.currency_code,
    
    fees_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),
    
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- REFUNDS & CANCELLATIONS
-- =============================================

-- Refund requests and processing
CREATE TABLE public.refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    requested_by_user_id UUID, -- Customer or staff member
    refund_reason TEXT NOT NULL,
    refund_type TEXT NOT NULL CHECK (refund_type IN ('full', 'partial', 'service_fee_only')),
    
    original_amount DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    service_fee_refund DECIMAL(10,2) DEFAULT 0,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    status public.refund_status DEFAULT 'pending',
    
    -- Processing information
    processed_by_user_id UUID, -- Admin who processed
    processed_at TIMESTAMPTZ,
    processing_notes TEXT,
    
    -- External refund tracking
    payment_transaction_id UUID REFERENCES public.payment_transactions(id),
    provider_refund_id TEXT,
    
    -- Business rules
    is_eligible BOOLEAN DEFAULT true,
    eligibility_notes TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT refund_amount_check CHECK (refund_amount <= original_amount AND refund_amount > 0)
);

-- =============================================
-- OPERATIONAL TRACKING
-- =============================================

-- Ticket scanning/validation events
CREATE TABLE public.ticket_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    
    scanned_by_user_id UUID NOT NULL, -- Staff member
    scan_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    scan_type TEXT NOT NULL CHECK (scan_type IN ('entry', 'exit', 'validation', 'transfer')),
    scan_result TEXT NOT NULL CHECK (scan_result IN ('valid', 'invalid', 'duplicate', 'expired', 'cancelled')),
    
    -- Location and device information
    scan_location TEXT, -- "Main Gate", "VIP Entrance"
    device_info JSONB DEFAULT '{}'::jsonb,
    gps_coordinates POINT,
    
    -- Additional context
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Check-in tracking for transport
CREATE TABLE public.passenger_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    
    checked_in_by_user_id UUID NOT NULL, -- Staff member
    checkin_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    checkin_location TEXT, -- "Gate A", "Platform 2"
    
    -- Baggage tracking
    baggage_count INTEGER DEFAULT 0,
    baggage_weight_kg DECIMAL(5,2),
    special_baggage JSONB DEFAULT '[]'::jsonb,
    
    -- Boarding information
    boarding_group TEXT,
    boarding_priority INTEGER,
    
    seat_assignment_changed BOOLEAN DEFAULT false,
    new_seat_id UUID REFERENCES public.seats(id),
    
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================

-- Sales analytics (materialized view for performance)
CREATE MATERIALIZED VIEW public.sales_analytics AS
SELECT 
    DATE_TRUNC('day', o.created_at) AS sales_date,
    o.booking_status,
    COUNT(o.id) AS order_count,
    COUNT(t.id) AS ticket_count,
    SUM(o.total_amount) AS total_revenue,
    SUM(o.service_fee) AS total_fees,
    o.currency,
    e.event_category,
    tr.transport_type,
    org.business_type,
    org.city AS organizer_city
FROM public.orders o
LEFT JOIN public.tickets t ON o.id = t.order_id
LEFT JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
LEFT JOIN public.events e ON tt.event_id = e.id
LEFT JOIN public.transport_trips trip ON tt.trip_id = trip.id
LEFT JOIN public.transport_routes tr ON trip.route_id = tr.id
LEFT JOIN public.organizers org ON COALESCE(e.organizer_id, tr.organizer_id) = org.id
WHERE o.payment_status = 'completed'
GROUP BY 
    DATE_TRUNC('day', o.created_at),
    o.booking_status, 
    o.currency,
    e.event_category,
    tr.transport_type,
    org.business_type,
    org.city;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Core performance indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(booking_status, payment_status);

CREATE INDEX idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX idx_tickets_status ON public.tickets(ticket_status);
CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code_data);

CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_venue_id ON public.events(venue_id);
CREATE INDEX idx_events_category ON public.events(event_category);
CREATE INDEX idx_events_datetime ON public.events(start_datetime);
CREATE INDEX idx_events_published ON public.events(is_published, is_cancelled);

CREATE INDEX idx_trips_route_id ON public.transport_trips(route_id);
CREATE INDEX idx_trips_departure ON public.transport_trips(departure_datetime);

CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_type ON public.venues(venue_type);
CREATE INDEX idx_venues_location ON public.venues USING gist(ll_to_earth(latitude, longitude));

-- Search optimization
CREATE INDEX idx_events_search ON public.events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_venues_search ON public.venues USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================
-- TRIGGERS FOR AUTOMATION
-- =============================================

-- Update timestamps
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();