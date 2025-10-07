import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  title: string;
  type: 'event' | 'transport';
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price_from: number;
  currency: string;
  capacity: number;
  available: number;
  image: string;
  featured: boolean;
  event_category?: string;
  start_datetime?: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch published events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            event_category,
            start_datetime,
            end_datetime,
            featured_image,
            is_featured,
            venues (
              name,
              city,
              capacity
            ),
            ticket_types (
              price,
              currency,
              quantity_available,
              quantity_total
            )
          `)
          .eq('is_published', true)
          .eq('is_cancelled', false)
          .gte('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true })
          .limit(50);

        if (eventsError) throw eventsError;

        // Transform events data
        const transformedEvents: Event[] = (eventsData || []).map((event: any) => {
          const venue = event.venues;
          const ticketTypes = event.ticket_types || [];
          const lowestPrice = ticketTypes.length > 0 
            ? Math.min(...ticketTypes.map((t: any) => t.price || 0))
            : 0;
          const totalAvailable = ticketTypes.reduce((sum: number, t: any) => sum + (t.quantity_available || 0), 0);
          const totalCapacity = ticketTypes.reduce((sum: number, t: any) => sum + (t.quantity_total || 0), 0);

          const startDate = new Date(event.start_datetime);

          return {
            id: event.id,
            title: event.title,
            type: 'event',
            category: event.event_category || 'general',
            date: startDate.toISOString().split('T')[0],
            time: startDate.toTimeString().slice(0, 5),
            venue: venue?.name || 'TBA',
            location: venue?.city || 'Zimbabwe',
            price_from: lowestPrice,
            currency: ticketTypes[0]?.currency || 'USD',
            capacity: totalCapacity || venue?.capacity || 0,
            available: totalAvailable || 0,
            image: event.featured_image || '/placeholder-event.jpg',
            featured: event.is_featured || false,
            event_category: event.event_category,
            start_datetime: event.start_datetime
          };
        });

        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};
