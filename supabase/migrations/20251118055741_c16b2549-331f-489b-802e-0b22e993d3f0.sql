-- Fix SECURITY DEFINER functions by adding SET search_path = public
-- This prevents privilege escalation through search path manipulation

-- 1. block_slot_on_payment
CREATE OR REPLACE FUNCTION public.block_slot_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When payment status changes to 'paid', block the slot
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    -- Check if service_availability record exists for this date
    IF EXISTS (
      SELECT 1 FROM public.service_availability 
      WHERE service_id = NEW.service_id 
      AND date = NEW.event_date
    ) THEN
      -- Update existing record to mark as unavailable
      UPDATE public.service_availability
      SET 
        is_available = false,
        current_bookings = COALESCE(current_bookings, 0) + 1,
        notes = COALESCE(notes || ' | ', '') || 'Booking #' || NEW.id || ' confirmed'
      WHERE service_id = NEW.service_id 
      AND date = NEW.event_date;
    ELSE
      -- Create new availability record marked as unavailable
      INSERT INTO public.service_availability (
        service_id,
        date,
        is_available,
        current_bookings,
        max_capacity,
        notes
      ) VALUES (
        NEW.service_id,
        NEW.event_date,
        false,
        1,
        1,
        'Booking #' || NEW.id || ' confirmed'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  RETURN NEW;
END;
$$;

-- 3. calculate_risk_score
CREATE OR REPLACE FUNCTION public.calculate_risk_score(order_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_score INTEGER := 0;
  order_record RECORD;
  device_record RECORD;
  recent_orders INTEGER;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = order_uuid;
  
  -- Check purchase velocity (multiple orders in short time)
  SELECT COUNT(*) INTO recent_orders 
  FROM public.orders 
  WHERE customer_email = order_record.customer_email 
  AND created_at > now() - INTERVAL '1 hour';
  
  IF recent_orders > 3 THEN
    risk_score := risk_score + 30;
  ELSIF recent_orders > 1 THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- Check if large quantity order
  IF order_record.total_amount > 1000 THEN
    risk_score := risk_score + 15;
  END IF;
  
  -- Check for suspicious patterns
  IF order_record.customer_first_name = order_record.customer_last_name THEN
    risk_score := risk_score + 5;
  END IF;
  
  RETURN LEAST(risk_score, 100);
END;
$$;

-- 4. refresh_business_metrics
CREATE OR REPLACE FUNCTION public.refresh_business_metrics()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  REFRESH MATERIALIZED VIEW public.business_metrics;
$$;

-- 5. cleanup_expired_csrf_tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_csrf_tokens()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.csrf_tokens 
  WHERE expires_at < now();
END;
$$;

-- 6. prevent_ticket_type_deletion
CREATE OR REPLACE FUNCTION public.prevent_ticket_type_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.tickets WHERE ticket_type_id = OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete ticket type with sold tickets. Cancel or refund orders first.';
  END IF;
  RETURN OLD;
END;
$$;

-- 7. prevent_event_deletion
CREATE OR REPLACE FUNCTION public.prevent_event_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    WHERE tt.event_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete event with sold tickets. Cancel the event instead.';
  END IF;
  RETURN OLD;
END;
$$;

-- 8. prevent_venue_deletion
CREATE OR REPLACE FUNCTION public.prevent_venue_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    JOIN public.events e ON tt.event_id = e.id
    WHERE e.venue_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete venue with events that have sold tickets. Cancel or move events first.';
  END IF;
  RETURN OLD;
END;
$$;

-- 9. prevent_route_deletion
CREATE OR REPLACE FUNCTION public.prevent_route_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
    JOIN public.transport_trips tr ON tt.trip_id = tr.id
    WHERE tr.route_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete route with trips that have sold tickets. Cancel or reschedule trips first.';
  END IF;
  RETURN OLD;
END;
$$;

-- 10. check_duplicate_scan
CREATE OR REPLACE FUNCTION public.check_duplicate_scan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for duplicate scans within 5 minutes
  IF EXISTS (
    SELECT 1 FROM public.ticket_validations 
    WHERE ticket_id = NEW.ticket_id 
    AND validation_result = 'valid'
    AND created_at > now() - INTERVAL '5 minutes'
  ) THEN
    -- Create fraud alert
    INSERT INTO public.fraud_alerts (
      alert_type, entity_type, entity_id, severity_level, details
    ) VALUES (
      'duplicate_scan', 'ticket', NEW.ticket_id, 'high',
      jsonb_build_object(
        'previous_scan_time', (
          SELECT created_at FROM public.ticket_validations 
          WHERE ticket_id = NEW.ticket_id AND validation_result = 'valid'
          ORDER BY created_at DESC LIMIT 1
        ),
        'device_fingerprint', NEW.device_fingerprint,
        'ip_address', NEW.ip_address
      )
    );
    
    -- Mark as duplicate
    NEW.validation_result = 'duplicate';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;