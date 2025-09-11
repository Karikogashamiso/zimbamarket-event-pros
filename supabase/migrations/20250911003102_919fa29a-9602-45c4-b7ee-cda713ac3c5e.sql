-- =============================================
-- INCREMENTAL TICKETING SYSTEM MIGRATION
-- Adding new tables for comprehensive ticketing system
-- =============================================

-- Create new enums only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_type') THEN
        CREATE TYPE public.business_type AS ENUM ('event_organizer', 'transport_operator', 'venue_operator', 'club_operator');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
        CREATE TYPE public.event_category AS ENUM ('concert', 'festival', 'conference', 'sports', 'theater', 'club_night', 'restaurant');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transport_type') THEN
        CREATE TYPE public.transport_type AS ENUM ('bus', 'flight', 'train', 'ferry');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seat_type') THEN
        CREATE TYPE public.seat_type AS ENUM ('standard', 'premium', 'vip', 'accessible', 'table', 'standing');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
        CREATE TYPE public.ticket_status AS ENUM ('valid', 'used', 'cancelled', 'refunded', 'expired');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'checked_in', 'completed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status') THEN
        CREATE TYPE public.refund_status AS ENUM ('pending', 'processing', 'approved', 'rejected', 'completed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_code') THEN
        CREATE TYPE public.currency_code AS ENUM ('USD', 'ZWL', 'RTGS');
    END IF;
END $$;

-- =============================================
-- CORE BUSINESS ENTITIES
-- =============================================

-- Organizers/Operators (Event organizers, transport companies, clubs)
CREATE TABLE IF NOT EXISTS public.organizers (
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
    bank_details JSONB DEFAULT '{}'::jsonb,
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT organizers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Venues (Event spaces, clubs, airports, bus stations)
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    venue_type TEXT NOT NULL,
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

-- Seat maps for venues
CREATE TABLE IF NOT EXISTS public.seat_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    total_capacity INTEGER NOT NULL,
    seat_configuration JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual seats within a seat map
CREATE TABLE IF NOT EXISTS public.seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_map_id UUID REFERENCES public.seat_maps(id) ON DELETE CASCADE,
    seat_identifier TEXT NOT NULL,
    seat_type public.seat_type NOT NULL DEFAULT 'standard',
    row_name TEXT,
    seat_number INTEGER,
    position_x INTEGER,
    position_y INTEGER,
    base_price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    is_accessible BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(seat_map_id, seat_identifier)
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
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
    
    age_restriction INTEGER,
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

-- Transport routes
CREATE TABLE IF NOT EXISTS public.transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    transport_type public.transport_type NOT NULL,
    
    route_name TEXT NOT NULL,
    route_code TEXT,
    
    origin_venue_id UUID NOT NULL REFERENCES public.venues(id),
    destination_venue_id UUID NOT NULL REFERENCES public.venues(id),
    
    distance_km INTEGER,
    estimated_duration_minutes INTEGER,
    intermediate_stops JSONB DEFAULT '[]'::jsonb,
    
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT routes_different_venues CHECK (origin_venue_id != destination_venue_id)
);

-- Transport trips
CREATE TABLE IF NOT EXISTS public.transport_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    seat_map_id UUID REFERENCES public.seat_maps(id),
    
    trip_number TEXT,
    vehicle_identifier TEXT,
    
    departure_datetime TIMESTAMPTZ NOT NULL,
    arrival_datetime TIMESTAMPTZ NOT NULL,
    
    check_in_opens_minutes INTEGER DEFAULT 60,
    boarding_closes_minutes INTEGER DEFAULT 15,
    
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

-- Ticket types
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.transport_trips(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    base_price DECIMAL(10,2) NOT NULL,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    max_quantity INTEGER,
    max_per_order INTEGER DEFAULT 10,
    
    early_bird_price DECIMAL(10,2),
    early_bird_end_datetime TIMESTAMPTZ,
    
    group_size_threshold INTEGER,
    group_discount_percentage DECIMAL(5,2),
    
    is_refundable BOOLEAN DEFAULT true,
    refund_policy_text TEXT,
    
    includes_benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT ticket_types_polymorphic_check CHECK (
        (event_id IS NOT NULL AND trip_id IS NULL) OR 
        (event_id IS NULL AND trip_id IS NOT NULL)
    ),
    CONSTRAINT ticket_types_price_positive CHECK (base_price > 0)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    
    user_id UUID,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_first_name TEXT NOT NULL,
    customer_last_name TEXT NOT NULL,
    
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    booking_status public.booking_status DEFAULT 'pending',
    payment_status public.payment_status DEFAULT 'pending',
    
    booking_source TEXT DEFAULT 'web',
    referral_code TEXT,
    special_requests TEXT,
    
    expires_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT orders_total_calculation CHECK (total_amount = subtotal + tax_amount + service_fee),
    CONSTRAINT orders_customer_email_check CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id),
    seat_id UUID REFERENCES public.seats(id),
    
    original_price DECIMAL(10,2) NOT NULL,
    paid_price DECIMAL(10,2) NOT NULL,
    currency public.currency_code NOT NULL DEFAULT 'USD',
    
    holder_first_name TEXT,
    holder_last_name TEXT,
    holder_email TEXT,
    holder_phone TEXT,
    
    ticket_status public.ticket_status DEFAULT 'valid',
    qr_code_data TEXT NOT NULL,
    
    scanned_at TIMESTAMPTZ,
    scanned_by_user_id UUID,
    scan_location TEXT,
    
    original_holder_email TEXT,
    transferred_at TIMESTAMPTZ,
    transfer_reason TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON public.tickets(qr_code_data);

-- Create triggers for timestamps (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Drop existing triggers if they exist
        DROP TRIGGER IF EXISTS update_organizers_updated_at ON public.organizers;
        DROP TRIGGER IF EXISTS update_venues_updated_at ON public.venues;
        DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
        DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
        DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
        
        -- Create new triggers
        CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;