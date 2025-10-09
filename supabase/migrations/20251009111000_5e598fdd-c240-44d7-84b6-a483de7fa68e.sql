-- Add RLS policy for service providers to view booking requests for their services
CREATE POLICY "Service providers can view booking requests for their services"
ON booking_requests
FOR SELECT
USING (
  service_id IN (
    SELECT s.id 
    FROM services s
    INNER JOIN business_listings bl ON s.business_listing_id = bl.id
    WHERE bl.user_id = auth.uid()
  )
);

-- Add RLS policy for service providers to update booking requests for their services
CREATE POLICY "Service providers can update booking requests for their services"
ON booking_requests
FOR UPDATE
USING (
  service_id IN (
    SELECT s.id 
    FROM services s
    INNER JOIN business_listings bl ON s.business_listing_id = bl.id
    WHERE bl.user_id = auth.uid()
  )
);

-- Enable realtime for booking_requests so service providers get live updates
ALTER TABLE booking_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;