-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'business_owner', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create business_listings table for user-submitted businesses
CREATE TABLE public.business_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  email TEXT,
  website TEXT,
  price_from NUMERIC,
  price_unit TEXT DEFAULT 'service',
  capacity_min INTEGER,
  capacity_max INTEGER,
  amenities TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for business listings
CREATE POLICY "Users can view approved business listings" 
ON public.business_listings 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can create their own business listings" 
ON public.business_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business listings" 
ON public.business_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business listings" 
ON public.business_listings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all business listings" 
ON public.business_listings 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create payments table for Stripe integration
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('featured_listing', 'booking_fee', 'subscription')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_business_listings_updated_at
BEFORE UPDATE ON public.business_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update booking_requests to include payment info
ALTER TABLE public.booking_requests 
ADD COLUMN payment_id UUID REFERENCES public.payments(id),
ADD COLUMN total_amount NUMERIC,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- Create storage buckets for business images
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- Create storage policies for business images
CREATE POLICY "Anyone can view business images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-images');

CREATE POLICY "Authenticated users can upload business images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own business images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert admin user role (you'll need to update this with actual user ID)
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin');