-- =============================================
-- SECURITY: ENABLE RLS AND CREATE POLICIES (CORRECTED)
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passenger_checkins ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORGANIZERS POLICIES
-- =============================================

-- Users can view approved organizers
CREATE POLICY "Anyone can view approved organizers" ON public.organizers
FOR SELECT USING (status = 'approved');

-- Users can create their own organizer profile
CREATE POLICY "Users can create their own organizer profile" ON public.organizers
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own organizer profile
CREATE POLICY "Users can update their own organizer profile" ON public.organizers
FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all organizers
CREATE POLICY "Admins can manage all organizers" ON public.organizers
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- VENUES POLICIES
-- =============================================

-- Anyone can view active venues
CREATE POLICY "Anyone can view active venues" ON public.venues
FOR SELECT USING (is_active = true);

-- Organizers can manage their own venues
CREATE POLICY "Organizers can manage their own venues" ON public.venues
FOR ALL USING (
  organizer_id IN (
    SELECT id FROM public.organizers 
    WHERE user_id = auth.uid()
  )
);

-- Admins can manage all venues
CREATE POLICY "Admins can manage all venues" ON public.venues
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- SEAT MAPS POLICIES
-- =============================================

-- Anyone can view seat maps for active venues
CREATE POLICY "Anyone can view seat maps for active venues" ON public.seat_maps
FOR SELECT USING (
  venue_id IN (
    SELECT id FROM public.venues WHERE is_active = true
  )
);

-- Venue owners can manage their seat maps
CREATE POLICY "Venue owners can manage their seat maps" ON public.seat_maps
FOR ALL USING (
  venue_id IN (
    SELECT v.id FROM public.venues v
    JOIN public.organizers o ON v.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- =============================================
-- SEATS POLICIES
-- =============================================

-- Anyone can view seats for active venues
CREATE POLICY "Anyone can view seats for active venues" ON public.seats
FOR SELECT USING (
  seat_map_id IN (
    SELECT sm.id FROM public.seat_maps sm
    JOIN public.venues v ON sm.venue_id = v.id
    WHERE v.is_active = true
  )
);

-- Venue owners can manage their seats
CREATE POLICY "Venue owners can manage their seats" ON public.seats
FOR ALL USING (
  seat_map_id IN (
    SELECT sm.id FROM public.seat_maps sm
    JOIN public.venues v ON sm.venue_id = v.id
    JOIN public.organizers o ON v.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- =============================================
-- EVENTS POLICIES
-- =============================================

-- Anyone can view published events
CREATE POLICY "Anyone can view published events" ON public.events
FOR SELECT USING (is_published = true AND is_cancelled = false);

-- Organizers can manage their own events
CREATE POLICY "Organizers can manage their own events" ON public.events
FOR ALL USING (
  organizer_id IN (
    SELECT id FROM public.organizers 
    WHERE user_id = auth.uid()
  )
);

-- Admins can manage all events
CREATE POLICY "Admins can manage all events" ON public.events
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- TRANSPORT ROUTES POLICIES
-- =============================================

-- Anyone can view active transport routes
CREATE POLICY "Anyone can view active transport routes" ON public.transport_routes
FOR SELECT USING (is_active = true);

-- Transport operators can manage their own routes
CREATE POLICY "Transport operators can manage their own routes" ON public.transport_routes
FOR ALL USING (
  organizer_id IN (
    SELECT id FROM public.organizers 
    WHERE user_id = auth.uid() AND business_type = 'transport_operator'
  )
);

-- =============================================
-- TRANSPORT TRIPS POLICIES
-- =============================================

-- Anyone can view non-cancelled trips
CREATE POLICY "Anyone can view non-cancelled trips" ON public.transport_trips
FOR SELECT USING (
  is_cancelled = false AND 
  route_id IN (
    SELECT id FROM public.transport_routes WHERE is_active = true
  )
);

-- Transport operators can manage their own trips
CREATE POLICY "Transport operators can manage their own trips" ON public.transport_trips
FOR ALL USING (
  route_id IN (
    SELECT tr.id FROM public.transport_routes tr
    JOIN public.organizers o ON tr.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )
);

-- =============================================
-- TICKET TYPES POLICIES
-- =============================================

-- Anyone can view active ticket types for published events/trips
CREATE POLICY "Anyone can view active ticket types" ON public.ticket_types
FOR SELECT USING (
  is_active = true AND (
    (event_id IN (SELECT id FROM public.events WHERE is_published = true AND is_cancelled = false)) OR
    (trip_id IN (SELECT id FROM public.transport_trips WHERE is_cancelled = false))
  )
);

-- Organizers can manage their own ticket types
CREATE POLICY "Organizers can manage their own ticket types" ON public.ticket_types
FOR ALL USING (
  (event_id IN (
    SELECT e.id FROM public.events e
    JOIN public.organizers o ON e.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  )) OR 
  (trip_id IN (
    SELECT t.id FROM public.transport_trips t
    JOIN public.transport_routes r ON t.route_id = r.id
    JOIN public.organizers o ON r.organizer_id = o.id
    WHERE o.user_id = auth.uid()
  ))
);

-- =============================================
-- ORDERS POLICIES
-- =============================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id OR 
  (user_id IS NULL AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Anyone can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

-- Users can update their own orders (limited scenarios)
CREATE POLICY "Users can update their own orders" ON public.orders
FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Organizers can view orders for their events/trips
CREATE POLICY "Organizers can view orders for their events/trips" ON public.orders
FOR SELECT USING (
  id IN (
    SELECT DISTINCT o.id FROM public.orders o
    JOIN public.tickets t ON o.id = t.order_id
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    WHERE (
      tt.event_id IN (
        SELECT e.id FROM public.events e
        JOIN public.organizers org ON e.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      ) OR
      tt.trip_id IN (
        SELECT tr.id FROM public.transport_trips tr
        JOIN public.transport_routes r ON tr.route_id = r.id
        JOIN public.organizers org ON r.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      )
    )
  )
);

-- =============================================
-- TICKETS POLICIES
-- =============================================

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" ON public.tickets
FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE auth.uid() = user_id OR 
    (user_id IS NULL AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  ) OR
  holder_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- System can create tickets for orders
CREATE POLICY "System can create tickets for orders" ON public.tickets
FOR INSERT WITH CHECK (true);

-- Users can update their own tickets (for transfers)
CREATE POLICY "Users can update their own tickets" ON public.tickets
FOR UPDATE USING (
  order_id IN (
    SELECT id FROM public.orders WHERE auth.uid() = user_id
  ) OR
  holder_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Organizers can view tickets for their events/trips
CREATE POLICY "Organizers can view tickets for their events/trips" ON public.tickets
FOR SELECT USING (
  ticket_type_id IN (
    SELECT tt.id FROM public.ticket_types tt
    WHERE (
      tt.event_id IN (
        SELECT e.id FROM public.events e
        JOIN public.organizers org ON e.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      ) OR
      tt.trip_id IN (
        SELECT tr.id FROM public.transport_trips tr
        JOIN public.transport_routes r ON tr.route_id = r.id
        JOIN public.organizers org ON r.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      )
    )
  )
);

-- Staff can update tickets (for scanning)
CREATE POLICY "Staff can update tickets for scanning" ON public.tickets
FOR UPDATE USING (
  ticket_type_id IN (
    SELECT tt.id FROM public.ticket_types tt
    WHERE (
      tt.event_id IN (
        SELECT e.id FROM public.events e
        JOIN public.organizers org ON e.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      ) OR
      tt.trip_id IN (
        SELECT tr.id FROM public.transport_trips tr
        JOIN public.transport_routes r ON tr.route_id = r.id
        JOIN public.organizers org ON r.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      )
    )
  )
);

-- =============================================
-- PAYMENT TRANSACTIONS POLICIES
-- =============================================

-- Users can view their own payment transactions
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders WHERE auth.uid() = user_id
  )
);

-- System can create payment transactions
CREATE POLICY "System can create payment transactions" ON public.payment_transactions
FOR INSERT WITH CHECK (true);

-- Admins can manage all payment transactions
CREATE POLICY "Admins can manage all payment transactions" ON public.payment_transactions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- REFUND REQUESTS POLICIES
-- =============================================

-- Users can view their own refund requests
CREATE POLICY "Users can view their own refund requests" ON public.refund_requests
FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders WHERE auth.uid() = user_id
  ) OR
  requested_by_user_id = auth.uid()
);

-- Users can create refund requests for their orders
CREATE POLICY "Users can create refund requests" ON public.refund_requests
FOR INSERT WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE auth.uid() = user_id
  )
);

-- Admins can manage all refund requests
CREATE POLICY "Admins can manage all refund requests" ON public.refund_requests
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- TICKET SCANS POLICIES
-- =============================================

-- Staff can view scans for their events/trips
CREATE POLICY "Staff can view scans for their events/trips" ON public.ticket_scans
FOR SELECT USING (
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    WHERE (
      tt.event_id IN (
        SELECT e.id FROM public.events e
        JOIN public.organizers org ON e.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      ) OR
      tt.trip_id IN (
        SELECT tr.id FROM public.transport_trips tr
        JOIN public.transport_routes r ON tr.route_id = r.id
        JOIN public.organizers org ON r.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      )
    )
  )
);

-- Staff can create scan records
CREATE POLICY "Staff can create scan records" ON public.ticket_scans
FOR INSERT WITH CHECK (
  scanned_by_user_id = auth.uid() AND
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    WHERE (
      tt.event_id IN (
        SELECT e.id FROM public.events e
        JOIN public.organizers org ON e.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      ) OR
      tt.trip_id IN (
        SELECT tr.id FROM public.transport_trips tr
        JOIN public.transport_routes r ON tr.route_id = r.id
        JOIN public.organizers org ON r.organizer_id = org.id
        WHERE org.user_id = auth.uid()
      )
    )
  )
);

-- =============================================
-- PASSENGER CHECKINS POLICIES
-- =============================================

-- Transport staff can view checkins for their trips
CREATE POLICY "Transport staff can view checkins for their trips" ON public.passenger_checkins
FOR SELECT USING (
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    JOIN public.transport_trips tr ON tt.trip_id = tr.id
    JOIN public.transport_routes r ON tr.route_id = r.id
    JOIN public.organizers org ON r.organizer_id = org.id
    WHERE org.user_id = auth.uid()
  )
);

-- Transport staff can create checkin records
CREATE POLICY "Transport staff can create checkin records" ON public.passenger_checkins
FOR INSERT WITH CHECK (
  checked_in_by_user_id = auth.uid() AND
  ticket_id IN (
    SELECT t.id FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    JOIN public.transport_trips tr ON tt.trip_id = tr.id
    JOIN public.transport_routes r ON tr.route_id = r.id
    JOIN public.organizers org ON r.organizer_id = org.id
    WHERE org.user_id = auth.uid()
  )
);