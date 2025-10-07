import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, Ticket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { SectionErrorBoundary } from "@/components/ErrorBoundary";

interface Event {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  event_category: string;
  featured_image: string;
  venue: {
    name: string;
    city: string;
    address: string;
  };
  ticket_types: Array<{
    id: string;
    name: string;
    description: string;
    base_price: number;
    currency: string;
    max_quantity: number;
  }>;
}

interface Trip {
  id: string;
  trip_number: string;
  departure_datetime: string;
  arrival_datetime: string;
  route: {
    route_name: string;
    transport_type: string;
    origin_venue: { name: string; city: string };
    destination_venue: { name: string; city: string };
  };
  ticket_types: Array<{
    id: string;
    name: string;
    description: string;
    base_price: number;
    currency: string;
  }>;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "transport">("events");
  const [eventsPage, setEventsPage] = useState(1);
  const [tripsPage, setTripsPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [hasMoreTrips, setHasMoreTrips] = useState(true);
  const ITEMS_PER_PAGE = 12;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventsAndTrips();
  }, [eventsPage, tripsPage]);

  const fetchEventsAndTrips = async () => {
    setLoading(true);
    try {
      // Fetch events with venue and ticket types
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          start_datetime,
          end_datetime,
          event_category,
          featured_image,
          venue:venues(name, city, address),
          ticket_types(id, name, description, base_price, currency, max_quantity)
        `)
        .eq('is_published', true)
        .eq('is_cancelled', false)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .range((eventsPage - 1) * ITEMS_PER_PAGE, eventsPage * ITEMS_PER_PAGE - 1);

      if (eventsError) throw eventsError;
      setHasMoreEvents((eventsData?.length || 0) === ITEMS_PER_PAGE);

      // Fetch transport trips with routes and ticket types
      const { data: tripsData, error: tripsError } = await supabase
        .from('transport_trips')
        .select(`
          id,
          trip_number,
          departure_datetime,
          arrival_datetime,
          route:transport_routes(
            route_name,
            transport_type,
            origin_venue:venues!transport_routes_origin_venue_id_fkey(name, city),
            destination_venue:venues!transport_routes_destination_venue_id_fkey(name, city)
          ),
          ticket_types(id, name, description, base_price, currency)
        `)
        .eq('is_cancelled', false)
        .gte('departure_datetime', new Date().toISOString())
        .order('departure_datetime', { ascending: true })
        .range((tripsPage - 1) * ITEMS_PER_PAGE, tripsPage * ITEMS_PER_PAGE - 1);

      if (tripsError) throw tripsError;
      setHasMoreTrips((tripsData?.length || 0) === ITEMS_PER_PAGE);

      setEvents(eventsData || []);
      setTrips(tripsData || []);
    } catch (error: any) {
      console.error('Error fetching events/trips:', error);
      toast({
        title: "Error",
        description: "Failed to load events and trips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = (eventId: string, type: 'event' | 'trip') => {
    navigate(`/checkout?${type}Id=${eventId}`);
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Events & Tickets | ZimEventPro</title>
        <meta name="description" content="Browse and book tickets for upcoming events and transport trips in Zimbabwe. Concerts, festivals, conferences, and intercity bus tickets available." />
      </Helmet>

      {/* Header Spacer */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events & Tickets</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Book tickets for the best events and transport services in Zimbabwe
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "events" | "transport")}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="transport">
                <Ticket className="w-4 h-4 mr-2" />
                Transport
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <SectionErrorBoundary sectionName="events list">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading events...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground">Check back soon for new events!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <Card key={event.id} className="hover-lift overflow-hidden">
                        {event.featured_image && (
                          <div className="aspect-video overflow-hidden">
                            <img 
                              src={event.featured_image} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{event.event_category}</Badge>
                            {event.ticket_types?.[0] && (
                              <span className="text-lg font-bold">
                                ${event.ticket_types[0].base_price}
                              </span>
                            )}
                          </div>
                          <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.start_datetime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.start_datetime)}</span>
                            </div>
                            {event.venue && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{event.venue.name}, {event.venue.city}</span>
                              </div>
                            )}
                          </div>

                          <Button 
                            className="w-full gap-2"
                            onClick={() => handleBuyTickets(event.id, 'event')}
                            disabled={!event.ticket_types || event.ticket_types.length === 0}
                          >
                            <Ticket className="w-4 h-4" />
                            Buy Tickets
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  )}

                  {/* Pagination for Events */}
                  {events.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                        disabled={eventsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {eventsPage}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setEventsPage(p => p + 1)}
                        disabled={!hasMoreEvents}
                      >
                        Next
                      </Button>
                    </div>
                  )}
              </SectionErrorBoundary>
            </TabsContent>

            <TabsContent value="transport">
              <SectionErrorBoundary sectionName="transport list">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading trips...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Available Trips</h3>
                    <p className="text-muted-foreground">Check back soon for new routes!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.map((trip) => (
                      <Card key={trip.id} className="hover-lift">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{trip.route.transport_type}</Badge>
                            {trip.trip_number && (
                              <span className="text-sm text-muted-foreground">
                                Trip #{trip.trip_number}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-xl">
                            {trip.route.route_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">From</p>
                              <p className="text-muted-foreground text-sm">
                                {trip.route.origin_venue.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {trip.route.origin_venue.city}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">To</p>
                              <p className="text-muted-foreground text-sm">
                                {trip.route.destination_venue.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {trip.route.destination_venue.city}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Departure</span>
                              <span className="font-medium">
                                {formatDate(trip.departure_datetime)} • {formatTime(trip.departure_datetime)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Arrival</span>
                              <span className="font-medium">
                                {formatTime(trip.arrival_datetime)}
                              </span>
                            </div>
                          </div>

                          {trip.ticket_types?.[0] && (
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-muted-foreground">From</span>
                              <span className="text-2xl font-bold">
                                ${trip.ticket_types[0].base_price}
                              </span>
                            </div>
                          )}

                          <Button 
                            className="w-full gap-2"
                            onClick={() => handleBuyTickets(trip.id, 'trip')}
                            disabled={!trip.ticket_types || trip.ticket_types.length === 0}
                          >
                            <Ticket className="w-4 h-4" />
                            Book Tickets
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  )}

                  {/* Pagination for Transport */}
                  {trips.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setTripsPage(p => Math.max(1, p - 1))}
                        disabled={tripsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {tripsPage}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setTripsPage(p => p + 1)}
                        disabled={!hasMoreTrips}
                      >
                        Next
                      </Button>
                    </div>
                  )}
              </SectionErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Events;
