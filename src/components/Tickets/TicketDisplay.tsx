import React from 'react';
import { TicketTemplate } from './TicketTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface TicketDisplayProps {
  orderDetails: any;
  tickets: any[];
  onDownload?: (ticketId: string, format: 'pdf' | 'image') => void;
  onShare?: (ticketId: string, method: 'email' | 'whatsapp') => void;
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  orderDetails,
  tickets,
  onDownload,
  onShare
}) => {
  const handleDownload = (ticketId: string, format: 'pdf' | 'image') => {
    onDownload?.(ticketId, format);
    toast.success(`Ticket ${format.toUpperCase()} download started`);
  };

  const handleShare = (ticket: any, method: 'email' | 'whatsapp') => {
    const message = `Your ticket for ${ticket.metadata?.eventInfo?.title || 'Event'} - Ticket #${ticket.ticket_number}`;
    
    if (method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}%0A%0ATicket details:%0AEvent: ${ticket.metadata?.eventInfo?.title}%0ADate: ${ticket.metadata?.eventInfo?.date}%0AVenue: ${ticket.metadata?.eventInfo?.venue}%0A%0APresent this message and your ID at the venue.`;
      window.open(whatsappUrl, '_blank');
    } else if (method === 'email') {
      const subject = `Your Event Ticket - ${ticket.ticket_number}`;
      const body = `${message}%0A%0ATicket Details:%0AEvent: ${ticket.metadata?.eventInfo?.title}%0ADate: ${ticket.metadata?.eventInfo?.date}%0AVenue: ${ticket.metadata?.eventInfo?.venue}%0ATicket Number: ${ticket.ticket_number}%0A%0APlease present this email and your ID at the venue.`;
      window.open(`mailto:${ticket.holder_email}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
    }

    onShare?.(ticket.id, method);
    toast.success(`Ticket shared via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
  };

  const convertTicketToDisplayFormat = (ticket: any, order: any) => {
    const eventInfo = ticket.metadata?.eventInfo || {};
    
    // Get customer name from ticket holder fields or fallback to order customer info
    const firstName = ticket.holder_first_name || order.customer_first_name || '';
    const lastName = ticket.holder_last_name || order.customer_last_name || '';
    const customerName = `${firstName} ${lastName}`.trim() || 'Guest';
    
    return {
      ticketNumber: ticket.ticket_number || 'N/A',
      eventTitle: eventInfo.title || 'General Event',
      eventType: 'event' as const,
      dateTime: eventInfo.date || new Date().toISOString(),
      venue: eventInfo.venue || 'TBA',
      location: eventInfo.location || 'Zimbabwe',
      customerName: customerName,
      ticketType: ticket.metadata?.tierName || 'General Admission',
      price: ticket.paid_price || 0,
      currency: ticket.currency || 'USD',
      seatInfo: ticket.seat_id ? {
        row: 'A',
        seat: '1',
        section: 'General'
      } : undefined,
      qrCodeData: ticket.qr_code_data || '',
      organizerName: 'ZEP Events',
      specialInstructions: order.special_requests || undefined,
    };
  };

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No tickets available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Your Digital Tickets
          </CardTitle>
          <p className="text-muted-foreground">
            {tickets.length} ticket{tickets.length > 1 ? 's' : ''} generated with secure QR codes
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Actions */}
          <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                tickets.forEach(ticket => handleDownload(ticket.id, 'pdf'));
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download All PDFs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const firstTicket = tickets[0];
                handleShare(firstTicket, 'email');
              }}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Tickets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const firstTicket = tickets[0];
                handleShare(firstTicket, 'whatsapp');
              }}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share via WhatsApp
            </Button>
          </div>

          {/* Individual Tickets */}
          <div className="space-y-8">
            {tickets.map((ticket, index) => {
              const ticketData = convertTicketToDisplayFormat(ticket, orderDetails);
              
              return (
                <div key={ticket.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Ticket {index + 1} of {tickets.length}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(ticket.id, 'pdf')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(ticket, 'whatsapp')}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                  
                  <TicketTemplate
                    ticket={ticketData}
                    variant="standard"
                    showDownloadButton={true}
                    onDownload={(format) => handleDownload(ticket.id, format)}
                    onShare={() => handleShare(ticket, 'whatsapp')}
                  />
                  
                  {/* Security Info */}
                  <div className="text-xs text-muted-foreground p-3 bg-green-50 rounded border-l-4 border-l-green-500">
                    <strong>Security Features:</strong> This ticket includes cryptographic signatures, 
                    secure QR codes, and anti-fraud protection. Each scan is monitored for suspicious activity.
                  </div>
                </div>
              );
            })}
          </div>

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Present your ticket QR code at the venue entrance</li>
              <li>• Bring a valid ID that matches the ticket holder name</li>
              <li>• Screenshots and printed copies are both accepted</li>
              <li>• Each ticket can only be used once</li>
              <li>• Contact support if you experience any issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};