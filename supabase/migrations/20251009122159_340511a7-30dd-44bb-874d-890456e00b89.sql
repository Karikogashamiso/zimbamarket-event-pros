-- Allow viewing orders by order number for confirmation (guest checkout support)
-- This allows users to view their order confirmation page even without authentication
CREATE POLICY "Anyone can view orders for confirmation"
  ON public.orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drop the old restrictive policy and create a more specific one for authenticated users
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Authenticated users can view their orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR customer_email = auth.email());