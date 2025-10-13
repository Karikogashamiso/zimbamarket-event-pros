-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar TEXT NOT NULL,
  event_type TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view active testimonials
CREATE POLICY "Anyone can view testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_featured = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing testimonials
INSERT INTO public.testimonials (name, role, company, content, rating, avatar, event_type, display_order) VALUES
  ('Tafadzwa Mutasa', 'Event Organizer', 'Harare Music Festival', 'ZimEventPro transformed how we sell tickets. Last year''s festival sold out in 2 hours instead of 2 weeks. The mobile integration with EcoCash made it accessible to everyone.', 5, 'TM', 'Music Festival', 1),
  ('Chipo Mubvumbi', 'Club Manager', 'Club Sankayi', 'Our VIP table bookings increased 300% since using ZimEventPro. Customers love the instant confirmation and QR code entry. No more guest list confusion!', 5, 'CM', 'Nightlife', 2),
  ('James Sibanda', 'Transport Manager', 'Eagle Liner', 'Bus bookings are now completely digital. Passengers can book from anywhere in Zimbabwe and pay with EcoCash. Our no-shows dropped to almost zero.', 5, 'JS', 'Transport', 3),
  ('Memory Chikwanha', 'Frequent Traveler', 'Marketing Executive', 'I use ZimEventPro for everything - flights to Cape Town, bus trips to Vic Falls, concert tickets. Everything in one place, always works perfectly.', 5, 'MC', 'Customer', 4),
  ('Blessing Ncube', 'Event Planner', 'Elite Events Zim', 'The analytics dashboard shows us exactly which marketing channels work best. We''ve optimized our campaigns and tripled our ticket sales efficiency.', 5, 'BN', 'Business', 5),
  ('Rutendo Mashonganyika', 'University Student', 'UZ Student', 'Finally, a booking platform that actually works in Zimbabwe! I can book concert tickets even when my data is low. The WhatsApp delivery is genius.', 5, 'RM', 'Student', 6);