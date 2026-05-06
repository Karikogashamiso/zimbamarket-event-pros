import { useState, useEffect, useCallback} from 'react';
import { Ticket, Calendar, MapPin, Download, QrCode, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCodeLib from 'qrcode';
import DOMPurify from 'dompurify';

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
  const [orderCount, setOrderCount] = useState(0);
  const [viewingQR, setViewingQR] = useState<{ ticketNumber: string; qrData: string; title: string } | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, fetchTickets]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch orders by user_id OR customer_email (for guest purchases)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .or(`user_id.eq.${user!.id},customer_email.eq.${user!.email}`);

      if (ordersError) throw ordersError;
      
      const orderIds = ordersData?.map(o => o.id) || [];
      setOrderCount(orderIds.length);
      
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
    } catch (error: unknown) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

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

  const handleViewQR = async (ticket: TicketWithDetails) => {
    try {
      // Fetch the full ticket data with QR code
      const { data: ticketData, error } = await supabase
        .from('tickets')
        .select('qr_code_data, ticket_number')
        .eq('id', ticket.id)
        .single();

      if (error || !ticketData) {
        toast({
          title: 'Error',
          description: 'Failed to load QR code',
          variant: 'destructive',
        });
        return;
      }

      // Generate QR code image
      const qrUrl = await QRCodeLib.toDataURL(ticketData.qr_code_data, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      const title = ticket.ticket_type.event?.title || ticket.ticket_type.trip?.route.route_name || 'Event';
      
      setQrImageUrl(qrUrl);
      setViewingQR({
        ticketNumber: ticketData.ticket_number,
        qrData: ticketData.qr_code_data,
        title
      });
    } catch (error) {
      console.error('Error viewing QR:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTicket = async (ticket: TicketWithDetails) => {
    try {
      toast({
        title: 'Generating ticket...',
        description: 'Please wait while we prepare your ticket',
      });

      // Create a temporary container for the ticket
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      document.body.appendChild(container);

      // Get ticket data
      const { data: ticketData, error } = await supabase
        .from('tickets')
        .select('qr_code_data, ticket_number')
        .eq('id', ticket.id)
        .single();

      if (error || !ticketData) throw new Error('Failed to fetch ticket data');

      // Generate QR code
      const qrUrl = await QRCodeLib.toDataURL(ticketData.qr_code_data, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      const isEvent = !!ticket.ticket_type.event;
      const title = isEvent ? ticket.ticket_type.event?.title : ticket.ticket_type.trip?.route.route_name;
      const dateTime = isEvent ? ticket.ticket_type.event?.start_datetime : ticket.ticket_type.trip?.departure_datetime;
      const location = isEvent 
        ? `${ticket.ticket_type.event?.venue.name}, ${ticket.ticket_type.event?.venue.city}`
        : `${ticket.ticket_type.trip?.route.origin_venue.name} → ${ticket.ticket_type.trip?.route.destination_venue.name}`;

      // Sanitize all user-generated content to prevent XSS attacks
      const sanitizedTitle = DOMPurify.sanitize(title, { ALLOWED_TAGS: [] });
      const sanitizedLocation = DOMPurify.sanitize(location, { ALLOWED_TAGS: [] });
      const sanitizedTicketType = DOMPurify.sanitize(ticket.ticket_type.name, { ALLOWED_TAGS: [] });
      const sanitizedTicketNumber = DOMPurify.sanitize(ticketData.ticket_number, { ALLOWED_TAGS: [] });
      const sanitizedOrderNumber = DOMPurify.sanitize(ticket.order.order_number, { ALLOWED_TAGS: [] });

      // Build ticket HTML with sanitized data
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px;">ZimEventPro</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your Digital Ticket</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #333;">${sanitizedTitle}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
              <div>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">Date & Time</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600;">${formatDate(dateTime || '')}</p>
                <p style="margin: 0; font-size: 14px;">${formatTime(dateTime || '')}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">Location</p>
                <p style="margin: 0; font-size: 14px;">${sanitizedLocation}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">Ticket Type</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600;">${sanitizedTicketType}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase;">Amount Paid</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600;">${formatCurrency(ticket.order.total_amount, ticket.order.currency)}</p>
              </div>
            </div>

            <div style="text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
              <img src="${qrUrl}" alt="QR Code" style="width: 300px; height: 300px;" />
              <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 14px; color: #666;">Ticket #${sanitizedTicketNumber}</p>
            </div>

            <div style="border-top: 2px dashed #e0e0e0; padding-top: 20px; font-size: 12px; color: #666; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;"><strong>Important:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Present this ticket (digital or printed) at the venue entrance</li>
                <li>Bring a valid ID that matches the ticket holder name</li>
                <li>Each ticket can only be used once</li>
                <li>Order #${sanitizedOrderNumber}</li>
              </ul>
            </div>
          </div>
        </div>
      `;

      // Generate canvas and PDF
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width * 0.75, canvas.height * 0.75]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      pdf.save(`ticket-${ticketData.ticket_number}.pdf`);

      toast({
        title: 'Success!',
        description: 'Your ticket has been downloaded',
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to download ticket. Please try again.',
        variant: 'destructive',
      });
    }
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
          <h3 className="text-xl font-semibold mb-2">No Tickets Available</h3>
          <p className="text-muted-foreground mb-6">
            {orderCount > 0 ? (
              <>
                You have {orderCount} order{orderCount !== 1 ? 's' : ''} but no tickets were generated. 
                This may be due to pending payment or a system issue. Please make a new purchase or contact support if you've already paid.
              </>
            ) : (
              <>
                You haven't purchased any tickets yet. Browse events and transport to get started!
              </>
            )}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.href = '/events'}>
              Browse Events
            </Button>
            {orderCount > 0 && (
              <Button variant="outline" onClick={() => window.location.href = '/contact'}>
                Contact Support
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* QR Code Modal */}
      <Dialog open={!!viewingQR} onOpenChange={() => setViewingQR(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Your Ticket QR Code</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingQR(null)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {viewingQR && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{viewingQR.title}</h3>
                <div className="bg-white p-4 rounded-lg border-2 border-primary/20 inline-block">
                  <img 
                    src={qrImageUrl} 
                    alt="Ticket QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground font-mono">
                  {viewingQR.ticketNumber}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-1">📱 How to use:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Screenshot or save this QR code</li>
                  <li>• Present it at the venue entrance</li>
                  <li>• Bring a valid ID for verification</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewQR(ticket)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownloadTicket(ticket)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </>
  );
};
