-- Add foreign key constraint to service_reports table
ALTER TABLE public.service_reports
ADD CONSTRAINT service_reports_service_id_fkey
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;