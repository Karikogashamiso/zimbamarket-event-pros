-- Create function to block service availability when booking is paid
CREATE OR REPLACE FUNCTION public.block_slot_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When payment status changes to 'completed', block the slot
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
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

-- Create trigger on booking_requests table
DROP TRIGGER IF EXISTS trigger_block_slot_on_payment ON public.booking_requests;
CREATE TRIGGER trigger_block_slot_on_payment
  AFTER UPDATE ON public.booking_requests
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed' AND OLD.payment_status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION public.block_slot_on_payment();

-- Add comment
COMMENT ON FUNCTION public.block_slot_on_payment() IS 'Automatically blocks service availability slots when a booking payment is completed';