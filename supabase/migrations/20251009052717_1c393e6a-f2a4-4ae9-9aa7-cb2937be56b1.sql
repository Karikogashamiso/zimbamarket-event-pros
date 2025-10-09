-- Add RLS policy to allow users to view their own business applications
CREATE POLICY "Users can view their own business applications"
ON public.business_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);