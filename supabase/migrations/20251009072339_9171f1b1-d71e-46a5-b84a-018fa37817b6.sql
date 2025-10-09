-- Drop the existing foreign key constraint
ALTER TABLE booking_requests 
DROP CONSTRAINT IF EXISTS booking_requests_service_id_fkey;

-- Recreate it with CASCADE delete
ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES services(id) 
ON DELETE CASCADE;