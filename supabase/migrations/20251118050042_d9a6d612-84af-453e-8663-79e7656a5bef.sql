-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access to business images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own business images" ON storage.objects;

-- Create storage policy for public read access to business images
CREATE POLICY "Public read access to business images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

-- Create policy for authenticated users to upload business images  
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-images');

-- Create policy for users to update their own business images
CREATE POLICY "Users can update their own business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-images');