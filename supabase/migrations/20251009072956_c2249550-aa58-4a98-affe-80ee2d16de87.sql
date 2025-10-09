-- Add explicit SELECT policy for organizers to view their own profiles
DROP POLICY IF EXISTS "Users can view their own organizer profile" ON organizers;

CREATE POLICY "Users can view their own organizer profile"
ON organizers
FOR SELECT
USING (auth.uid() = user_id);