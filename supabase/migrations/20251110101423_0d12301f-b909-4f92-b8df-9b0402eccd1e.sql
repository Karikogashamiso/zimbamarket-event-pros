-- Add payment method tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_provider_id text;

-- Add index for faster lookups by provider transaction ID
CREATE INDEX IF NOT EXISTS idx_orders_payment_provider_id 
ON public.orders(payment_provider_id) 
WHERE payment_provider_id IS NOT NULL;

-- Add comment to document the columns
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used: contipay, card, ecocash, etc.';
COMMENT ON COLUMN public.orders.payment_provider_id IS 'Transaction ID from the payment provider';