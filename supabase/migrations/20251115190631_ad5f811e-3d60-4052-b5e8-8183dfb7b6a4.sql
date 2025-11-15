-- Add images column to business_applications table
ALTER TABLE business_applications 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create storage bucket for business application images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-applications', 'business-applications', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business applications
CREATE POLICY "Anyone can view business application images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-applications');

CREATE POLICY "Authenticated users can upload business application images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-applications' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own business application images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'business-applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business application images"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-applications' AND auth.uid()::text = (storage.foldername(name))[1]);