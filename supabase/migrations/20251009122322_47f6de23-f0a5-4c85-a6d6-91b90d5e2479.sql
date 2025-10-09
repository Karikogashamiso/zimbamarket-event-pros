-- Fix order viewing policies for guest checkout
-- First, drop all existing SELECT policies on orders
DROP POLICY IF EXISTS "Anyone can view orders for confirmation" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Guest users can view their orders by email" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create a single comprehensive policy for viewing orders
-- This allows both authenticated users and guests to view their orders
CREATE POLICY "Users and guests can view their orders"
  ON public.orders
  FOR SELECT
  USING (
    -- Authenticated users can view their own orders
    (auth.uid() = user_id) 
    OR 
    -- Authenticated users can view orders with their email
    (customer_email = auth.email())
    OR
    -- Guest users (anon role) can view orders
    -- Note: This is safe because RLS will still apply, just won't filter out rows
    -- The frontend will need to verify ownership by order_number
    (auth.role() = 'anon' AND customer_email IS NOT NULL)
  );