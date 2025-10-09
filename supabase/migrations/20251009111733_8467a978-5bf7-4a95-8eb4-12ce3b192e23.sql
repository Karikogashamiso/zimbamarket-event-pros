-- Drop the existing check constraint on booking_requests status
ALTER TABLE booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check;

-- Add new check constraint that includes approved and rejected statuses
ALTER TABLE booking_requests 
ADD CONSTRAINT booking_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));