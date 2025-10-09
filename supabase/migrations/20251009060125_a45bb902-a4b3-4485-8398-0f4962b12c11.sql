-- Add RLS policy to allow admins to delete business listings
CREATE POLICY "Admins can delete business listings"
ON public.business_listings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy to allow admins to delete services
CREATE POLICY "Admins can delete services"
ON public.services
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));