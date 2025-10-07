-- Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active services
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (active = true);

-- Allow service owners to manage their services
CREATE POLICY "Users can manage their own services"
ON public.services
FOR ALL
USING (
  category_id IN (
    SELECT category_id FROM business_listings WHERE user_id = auth.uid()
  )
);

-- Allow admins to manage all services
CREATE POLICY "Admins can manage all services"
ON public.services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);