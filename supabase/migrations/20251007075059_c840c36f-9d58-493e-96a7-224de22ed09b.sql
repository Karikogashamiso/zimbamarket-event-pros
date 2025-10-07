-- Drop the restrictive policy
DROP POLICY IF EXISTS "Transport operators can manage their own routes" ON public.transport_routes;

-- Create new policy that allows all organizers to manage transport routes
CREATE POLICY "Organizers can manage their own routes"
ON public.transport_routes
FOR ALL
USING (
  organizer_id IN (
    SELECT organizers.id
    FROM organizers
    WHERE organizers.user_id = auth.uid()
  )
);