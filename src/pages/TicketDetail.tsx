import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ticket, User, Calendar, MapPin, Clock, CheckCircle, 
  Download, Share2, ArrowLeft, QrCode 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MetaTags from '@/components/SEO/MetaTags';

export const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicketDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          orders (
            order_number,
            customer_name,
            customer_email,
            customer_phone,
            total_amount
          ),
          events (
            title,
            description,
            start_date,
            end_date,
            venue_name,
            address
          )
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      setTicket(data);
    } catch (error: unknown) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId, fetchTicketDetails]);

  const handleDownload = () => {
    toast.success('Download feature coming soon!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Event Ticket',
        text: `Check out my ticket for ${ticket?.events?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Ticket Not Found</h2>
            <p className="text-muted-foreground">The ticket you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500';
      case 'used':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <MetaTags
        title={`Ticket Details - ${ticket.events?.title || 'Event'} - ZimEventPro`}
        description="View your event ticket details"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/scan-ticket">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scanner
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Ticket Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">Event Ticket</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-1">
                    {ticket.events?.title || 'Event'}
                  </h1>
                  <p className="text-sm opacity-90">{ticket.ticket_number}</p>
                </div>
                <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                  {ticket.status?.toUpperCase()}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* QR Code */}
              {ticket.qr_code_url && (
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <div className="text-center space-y-2">
                    <img 
                      src={ticket.qr_code_url} 
                      alt="Ticket QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <QrCode className="w-3 h-3" />
                      Scan this code at the venue
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Event Details</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.events?.start_date 
                          ? new Date(ticket.events.start_date).toLocaleString('en-US', {
                              dateStyle: 'full',
                              timeStyle: 'short'
                            })
                          : 'TBA'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.events?.venue_name || 'Venue TBA'}
                      </p>
                      {ticket.events?.address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.events.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {ticket.seat_number && (
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Seat/Section</p>
                        <p className="text-sm text-muted-foreground">{ticket.seat_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Ticket Holder Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Ticket Holder</h3>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.holder_name || ticket.orders?.customer_name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {ticket.orders?.customer_email && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.orders.customer_email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scan History */}
              {ticket.scanned_at && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Scan History</h3>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Last Scanned</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(ticket.scanned_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Order Information */}
              <Separator />
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Order Information</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Order #:</span> {ticket.orders?.order_number}
                  </p>
                  {ticket.orders?.total_amount && (
                    <p className="text-sm">
                      <span className="font-medium">Amount:</span> ${ticket.orders.total_amount}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Please arrive at least 30 minutes before the event starts</li>
                <li>Present this QR code at the entrance for scanning</li>
                <li>This ticket is non-transferable and valid for one entry only</li>
                <li>Keep your ticket safe and do not share screenshots</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
