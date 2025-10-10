-- Add admin read policy for contact_submissions table
CREATE POLICY "Admins can view all contact submissions"
ON public.contact_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));