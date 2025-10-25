-- Update completed orders to link them to users based on email
-- This fixes tickets not showing in profile
UPDATE orders o
SET user_id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = o.customer_email
)
WHERE o.user_id IS NULL 
  AND o.payment_status = 'completed'
  AND EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = o.customer_email
  );

-- Add comment for documentation
COMMENT ON COLUMN orders.user_id IS 'Links order to authenticated user. NULL for guest orders. Updated post-payment for guest checkouts.';