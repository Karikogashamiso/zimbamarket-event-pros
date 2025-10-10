-- Add foreign key constraint from service_reports to profiles
ALTER TABLE public.service_reports
ADD CONSTRAINT service_reports_reported_by_user_id_fkey
FOREIGN KEY (reported_by_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;