-- Add CASCADE deletion for events when venues are deleted
-- This ensures that when a venue is deleted, related events are also handled

-- First, let's ensure tickets are properly handled when ticket_types are deleted
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_ticket_type_id_fkey;
ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_type_id_fkey 
  FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE RESTRICT;

-- Prevent deletion of ticket_types that have sold tickets
CREATE OR REPLACE FUNCTION prevent_ticket_type_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM tickets WHERE ticket_type_id = OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete ticket type with sold tickets. Cancel or refund orders first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_ticket_type_deletion
  BEFORE DELETE ON ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION prevent_ticket_type_deletion();

-- Prevent deletion of events that have sold tickets
CREATE OR REPLACE FUNCTION prevent_event_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    WHERE tt.event_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete event with sold tickets. Cancel the event instead.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_event_deletion
  BEFORE DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_event_deletion();

-- Prevent deletion of venues that have events with sold tickets
CREATE OR REPLACE FUNCTION prevent_venue_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    JOIN events e ON tt.event_id = e.id
    WHERE e.venue_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete venue with events that have sold tickets. Cancel or move events first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_venue_deletion
  BEFORE DELETE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION prevent_venue_deletion();

-- Prevent deletion of transport routes with sold tickets
CREATE OR REPLACE FUNCTION prevent_route_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    JOIN transport_trips tr ON tt.trip_id = tr.id
    WHERE tr.route_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete route with trips that have sold tickets. Cancel or reschedule trips first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_route_deletion
  BEFORE DELETE ON transport_routes
  FOR EACH ROW
  EXECUTE FUNCTION prevent_route_deletion();