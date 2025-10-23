-- Fix tickets RLS policy to allow users to see tickets by email
-- This allows users to see tickets from both authenticated purchases (user_id match)
-- and guest purchases that used their email address

DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;

CREATE POLICY "Users can view their own tickets" ON public.tickets
FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE auth.uid() = user_id 
    OR customer_email = auth.email()
  )
);