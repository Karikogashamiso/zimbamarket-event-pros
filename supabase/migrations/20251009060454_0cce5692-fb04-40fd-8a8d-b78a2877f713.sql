-- Add RLS policy to allow admins to delete business applications
CREATE POLICY "Admins can delete business applications"
ON public.business_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));