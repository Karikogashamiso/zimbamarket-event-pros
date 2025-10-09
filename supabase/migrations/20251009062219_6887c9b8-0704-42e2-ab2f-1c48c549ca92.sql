-- Add RLS policy to allow admins to delete transport routes
CREATE POLICY "Admins can delete transport routes"
ON public.transport_routes
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy to allow admins to delete transport trips
CREATE POLICY "Admins can delete transport trips"
ON public.transport_trips
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));