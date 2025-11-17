-- Allow users to delete their own business listings
CREATE POLICY "Users can delete their own business listings"
ON public.business_listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);