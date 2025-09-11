-- Safe RLS Policy Creation - Drop and recreate policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Users can manage their organizer profile" ON public.organizers;
DROP POLICY IF EXISTS "Everyone can view active venues" ON public.venues;
DROP POLICY IF EXISTS "Organizers can manage their venues" ON public.venues;
DROP POLICY IF EXISTS "Everyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Organizers can manage their events" ON public.events;
DROP POLICY IF EXISTS "Everyone can view active ticket types" ON public.ticket_types;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;

-- Ensure RLS is enabled
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create essential policies for organizers
CREATE POLICY "Users can manage their organizer profile" ON public.organizers
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all organizers" ON public.organizers
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create essential policies for venues
CREATE POLICY "Everyone can view active venues" ON public.venues
FOR SELECT USING (is_active = true);

CREATE POLICY "Organizers can manage their venues" ON public.venues
FOR ALL USING (
    organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
);

-- Create essential policies for events  
CREATE POLICY "Everyone can view published events" ON public.events
FOR SELECT USING (is_published = true AND is_cancelled = false);

CREATE POLICY "Organizers can manage their events" ON public.events
FOR ALL USING (
    organizer_id IN (SELECT id FROM public.organizers WHERE user_id = auth.uid())
);

-- Create essential policies for ticket types
CREATE POLICY "Everyone can view active ticket types" ON public.ticket_types
FOR SELECT USING (is_active = true);

-- Create essential policies for orders
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id OR customer_email = auth.email());

-- Create essential policies for tickets
CREATE POLICY "Anyone can create tickets" ON public.tickets
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own tickets" ON public.tickets
FOR SELECT USING (
    order_id IN (
        SELECT id FROM public.orders 
        WHERE auth.uid() = user_id OR customer_email = auth.email()
    )
);