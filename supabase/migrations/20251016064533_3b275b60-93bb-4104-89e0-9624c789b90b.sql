-- Add RLS policies for organizers to manage their own venues

-- Policy for organizers to update their own venues
CREATE POLICY "Organizers can update their own venues"
ON public.venues
FOR UPDATE
USING (
  organizer_id IN (
    SELECT id FROM organizers WHERE user_id = auth.uid()
  )
);

-- Policy for organizers to delete their own venues
CREATE POLICY "Organizers can delete their own venues"
ON public.venues
FOR DELETE
USING (
  organizer_id IN (
    SELECT id FROM organizers WHERE user_id = auth.uid()
  )
);