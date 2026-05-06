import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TicketTemplate } from './TicketTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Share2, Mail, MessageCircle } from 'lucide-react';

interface TicketGeneratorProps {
  ticketData: TicketData;
}

export const TicketGenerator: React.FC<TicketGeneratorProps> = ({ ticketData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample ticket data - replace with real data from props
  const sampleTicket = {
    ticketNumber: 'ZEP-2024-001234',
    eventTitle: 'Oliver Mtukudzi Tribute Concert',
    eventType: 'event' as const,
    dateTime: '2024-12-25T19:00:00',
    venue: 'Rainbow Towers',
    location: 'Harare, Zimbabwe',
    customerName: 'John Mukamuri',
    ticketType: 'VIP',
    price: 50,
    currency: 'USD',
    seatInfo: {
      row: 'A',
      seat: '12',
      section: 'VIP'
    },
    qrCodeData: JSON.stringify({
      ticketId: 'ZEP-2024-001234',
      eventId: 'evt_001',
      timestamp: Date.now(),
      hash: 'abc123def456'
    }),
    organizerName: 'ZimEventPro',
    organizerLogo: '/logo.png',
    specialInstructions: 'Please arrive 30 minutes early for VIP check-in',
    gateInfo: 'Gate B'
  };

  // Transport ticket sample
  const transportTicket = {
    ...sampleTicket,
    ticketNumber: 'ZEP-BUS-001234',
    eventTitle: 'Harare → Bulawayo Express',
    eventType: 'bus' as const,
    dateTime: '2024-12-25T06:00:00',
    venue: 'Roadport Terminal',
    location: 'Harare, Zimbabwe',
    ticketType: 'Standard',
    price: 25,
    seatInfo: {
      seat: '14A'
    },
    boardingTime: '05:30 AM',
    gateInfo: 'Bay 3',
    specialInstructions: 'Boarding closes 15 minutes before departure'
  };

  // Flight ticket sample  
  const flightTicket = {
    ...sampleTicket,
    ticketNumber: 'ZEP-FL-001234',
    eventTitle: 'Harare → Cape Town',
    eventType: 'flight' as const,
    dateTime: '2024-12-25T14:30:00',
    venue: 'Robert Gabriel Mugabe Airport',
    location: 'Harare, Zimbabwe',
    ticketType: 'Economy',
    price: 320,
    seatInfo: {
      seat: '12F'
    },
    boardingTime: '13:30',
    gateInfo: 'Gate 7',
    specialInstructions: 'Check-in opens 3 hours before departure'
  };

  const downloadTicket = async (format: 'pdf' | 'image', ticket: TicketData) => {
    setIsGenerating(true);
    try {
      const element = document.querySelector(`[data-ticket="${ticket.ticketNumber}"]`) as HTMLElement;
      if (!element) {
        toast.error('Ticket element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });

      if (format === 'image') {
        // Download as PNG
        const link = document.createElement('a');
        link.download = `ticket-${ticket.ticketNumber}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        toast.success('Ticket image downloaded!');
      } else {
        // Generate PDF
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width * 0.75, canvas.height * 0.75] // Convert to PDF units
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
        pdf.save(`ticket-${ticket.ticketNumber}.pdf`);
        toast.success('Ticket PDF downloaded!');
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
      toast.error('Failed to generate ticket');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareTicket = async (ticket: TicketData) => {
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: `Your ${ticket.eventTitle} Ticket`,
          text: `Ticket ${ticket.ticketNumber} for ${ticket.eventTitle}`,
          url: window.location.href
        });
      } else {
        // Fallback: Copy to clipboard
        const ticketUrl = `${window.location.origin}/ticket/${ticket.ticketNumber}`;
        await navigator.clipboard.writeText(ticketUrl);
        toast.success('Ticket link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing ticket:', error);
      toast.error('Failed to share ticket');
    }
  };

  const sendViaWhatsApp = (ticket: TicketData) => {
    const message = encodeURIComponent(
      `🎟️ Your ${ticket.eventTitle} ticket is ready!\n\n` +
      `📅 ${new Date(ticket.dateTime).toLocaleDateString('en-ZW')}\n` +
      `📍 ${ticket.venue}, ${ticket.location}\n` +
      `🎫 Ticket: ${ticket.ticketNumber}\n\n` +
      `View your ticket: ${window.location.origin}/ticket/${ticket.ticketNumber}`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const sendViaEmail = (ticket: TicketData) => {
    const subject = encodeURIComponent(`Your ${ticket.eventTitle} Ticket - ${ticket.ticketNumber}`);
    const body = encodeURIComponent(
      `Dear ${ticket.customerName},\n\n` +
      `Your ticket for ${ticket.eventTitle} is attached.\n\n` +
      `Event Details:\n` +
      `📅 Date: ${new Date(ticket.dateTime).toLocaleDateString('en-ZW')}\n` +
      `⏰ Time: ${new Date(ticket.dateTime).toLocaleTimeString('en-ZW')}\n` +
      `📍 Venue: ${ticket.venue}, ${ticket.location}\n` +
      `🎫 Ticket Number: ${ticket.ticketNumber}\n\n` +
      `Please present this ticket (digital or printed) at the venue.\n\n` +
      `Best regards,\n${ticket.organizerName}`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const tickets = [
    { data: sampleTicket, title: 'Event Ticket', variant: 'standard' as const },
    { data: transportTicket, title: 'Bus Ticket', variant: 'standard' as const },
    { data: flightTicket, title: 'Flight Ticket', variant: 'premium' as const }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Modern Ticket Templates</CardTitle>
          <p className="text-muted-foreground">
            Professional ticket designs optimized for email and WhatsApp delivery
          </p>
        </CardHeader>
      </Card>

      {tickets.map((ticket, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                <Badge variant="outline">{ticket.variant}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendViaWhatsApp(ticket.data)}
                  className="flex items-center gap-1"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendViaEmail(ticket.data)}
                  className="flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Email
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div data-ticket={ticket.data.ticketNumber}>
              <TicketTemplate
                ticket={ticket.data}
                variant={ticket.variant}
                showDownloadButton={true}
                onDownload={(format) => downloadTicket(format, ticket.data)}
                onShare={() => shareTicket(ticket.data)}
              />
            </div>

            {/* Delivery Options */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Delivery Methods</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  📧 <span>Email PDF/Image</span>
                </div>
                <div className="flex items-center gap-2">
                  📱 <span>WhatsApp Link</span>
                </div>
                <div className="flex items-center gap-2">
                  💾 <span>Download & Print</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Template Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Design Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Responsive mobile-first design</li>
                <li>• High-contrast QR codes</li>
                <li>• Zimbabwe-optimized branding</li>
                <li>• Perforation visual effects</li>
                <li>• Print-friendly layouts</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Delivery Optimization:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• WhatsApp image compression</li>
                <li>• Email PDF attachments</li>
                <li>• Offline QR code scanning</li>
                <li>• Multiple currency support</li>
                <li>• Dark mode compatibility</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              <span>Generating ticket...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};