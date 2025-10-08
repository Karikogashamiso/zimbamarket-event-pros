-- Add user_id to business_applications to track who submitted the application
ALTER TABLE public.business_applications
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_business_applications_user_id ON public.business_applications(user_id);

-- Add comment
COMMENT ON COLUMN public.business_applications.user_id IS 'The user who submitted this business application';

-- Update existing applications to set user_id to null (they can be claimed later)
-- New applications will automatically include the user_id