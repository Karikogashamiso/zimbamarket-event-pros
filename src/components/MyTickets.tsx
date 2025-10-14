import { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Download, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TicketWithDetails {
  id: string;
  ticket_number: string;
  ticket_status: string;
  order: {
    id: string;
    order_number: string;
    booking_status: string;
    payment_status: string;
    total_amount: number;
    currency: string;
    created_at: string;
  };
  ticket_type: {
    name: string;
    description: string;
    event?: {
      id: string;
      title: string;
      start_datetime: string;
      venue: {
        name: string;
        city: string;
      };
    };
    trip?: {
      id: string;
      trip_number: string;
      departure_datetime: string;
      route: {
        route_name: string;
        transport_type: string;
        origin_venue: {
          name: string;
          city: string;
        };
        destination_venue: {
          name: string;
          city: string;
        };
      };
    };
  };
}

export const MyTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Fetch orders by user_id OR customer_email (for guest purchases)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .or(`user_id.eq.${user!.id},customer_email.eq.${user!.email}`);

      if (ordersError) throw ordersError;
      
      const orderIds = ordersData?.map(o => o.id) || [];
      
      if (orderIds.length === 0) {
        setTickets([]);
        setLoading(false);
        return;
      }

      // Then fetch tickets with all related data
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          ticket_status,
          order_id,
          orders!inner(
            id,
            order_number,
            booking_status,
            payment_status,
            total_amount,
            currency,
            created_at
          ),
          ticket_types!inner(
            name,
            description,
            event_id,
            trip_id,
            events(
              id,
              title,
              start_datetime,
              venues(name, city)
            ),
            transport_trips(
              id,
              trip_number,
              departure_datetime,
              transport_routes(
                route_name,
                transport_type,
                origin_venue:venues!transport_routes_origin_venue_id_fkey(name, city),
                destination_venue:venues!transport_routes_destination_venue_id_fkey(name, city)
              )
            )
          )
        `)
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((ticket: any) => ({
        ...ticket,
        order: ticket.orders,
        ticket_type: {
          name: ticket.ticket_types.name,
          description: ticket.ticket_types.description,
          event: ticket.ticket_types.events ? {
            id: ticket.ticket_types.events.id,
            title: ticket.ticket_types.events.title,
            start_datetime: ticket.ticket_types.events.start_datetime,
            venue: ticket.ticket_types.events.venues
          } : undefined,
          trip: ticket.ticket_types.transport_trips ? {
            id: ticket.ticket_types.transport_trips.id,
            trip_number: ticket.ticket_types.transport_trips.trip_number,
            departure_datetime: ticket.ticket_types.transport_trips.departure_datetime,
            route: ticket.ticket_types.transport_trips.transport_routes
          } : undefined
        }
      }));
      
      setTickets(transformedData);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      valid: 'default',
      used: 'secondary',
      cancelled: 'destructive',
      refunded: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'ZWL' ? 'Z$' : 'RTGS$';
    return `${symbol}${amount}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tickets Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't purchased any tickets yet. Browse events and transport to get started!
          </p>
          <Button onClick={() => window.location.href = '/events'}>
            Browse Events & Transport
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const isEvent = !!ticket.ticket_type.event;
        const isTrip = !!ticket.ticket_type.trip;

        return (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">
                      {isEvent
                        ? ticket.ticket_type.event?.title
                        : ticket.ticket_type.trip?.route.route_name}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Order #{ticket.order.order_number}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(ticket.ticket_status)}
                  <Badge variant={ticket.order.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {ticket.order.payment_status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event/Trip Details */}
              <div className="space-y-2 text-sm">
                {isEvent && ticket.ticket_type.event && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(ticket.ticket_type.event.start_datetime)} •{' '}
                        {formatTime(ticket.ticket_type.event.start_datetime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {ticket.ticket_type.event.venue.name},{' '}
                        {ticket.ticket_type.event.venue.city}
                      </span>
                    </div>
                  </>
                )}

                {isTrip && ticket.ticket_type.trip && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(ticket.ticket_type.trip.departure_datetime)} •{' '}
                        {formatTime(ticket.ticket_type.trip.departure_datetime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {ticket.ticket_type.trip.route.origin_venue.name} →{' '}
                        {ticket.ticket_type.trip.route.destination_venue.name}
                      </span>
                    </div>
                    <Badge variant="outline">{ticket.ticket_type.trip.route.transport_type}</Badge>
                  </>
                )}
              </div>

              {/* Ticket Details */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ticket Type</p>
                    <p className="font-medium">{ticket.ticket_type.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ticket Number</p>
                    <p className="font-mono text-xs">{ticket.ticket_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Purchase Date</p>
                    <p className="font-medium">{formatDate(ticket.order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-medium">
                      {formatCurrency(ticket.order.total_amount, ticket.order.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
