-- Create table for CSRF tokens
CREATE TABLE public.csrf_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  session_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for token lookup
CREATE INDEX idx_csrf_tokens_token ON public.csrf_tokens(token);
CREATE INDEX idx_csrf_tokens_expires_at ON public.csrf_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for CSRF tokens (only edge functions can access)
CREATE POLICY "Service role can manage CSRF tokens" 
ON public.csrf_tokens 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_csrf_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.csrf_tokens 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clean up expired tokens periodically
-- This will be called by a scheduled job or manually