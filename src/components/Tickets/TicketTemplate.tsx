import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, Plane, Bus, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketData {
  ticketNumber: string;
  eventTitle: string;
  eventType: 'event' | 'flight' | 'bus';
  dateTime: string;
  venue: string;
  location: string;
  customerName: string;
  ticketType: string;
  price: number;
  currency: string;
  seatInfo?: {
    row?: string;
    seat?: string;
    section?: string;
  };
  qrCodeData: string;
  organizerName: string;
  organizerLogo?: string;
  specialInstructions?: string;
  gateInfo?: string;
  boardingTime?: string;
}

interface TicketTemplateProps {
  ticket: TicketData;
  variant?: 'standard' | 'premium' | 'compact';
  showDownloadButton?: boolean;
  onDownload?: (format: 'pdf' | 'image') => void;
  onShare?: () => void;
}

export const TicketTemplate: React.FC<TicketTemplateProps> = ({
  ticket,
  variant = 'standard',
  showDownloadButton = false,
  onDownload,
  onShare
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [ticket.qrCodeData]);

  const generateQRCode = async () => {
    try {
      let qrData = ticket.qrCodeData;
      
      // Check if qrCodeData is already a URL (new format)
      if (!qrData.startsWith('http://') && !qrData.startsWith('https://')) {
        // Old format: JSON string - convert to URL
        try {
          // Validate it's JSON
          JSON.parse(qrData);
          
          // Convert to base64 and create URL
          const base64Data = btoa(qrData);
          const appUrl = 'https://309c8f6f-cefd-4bca-8cda-808078a3b393.lovableproject.com';
          qrData = `${appUrl}/scan-ticket?ticket=${base64Data}`;
        } catch {
          // If not valid JSON, use as-is (legacy colon-separated format)
          const base64Data = btoa(qrData);
          const appUrl = 'https://309c8f6f-cefd-4bca-8cda-808078a3b393.lovableproject.com';
          qrData = `${appUrl}/scan-ticket?ticket=${base64Data}`;
        }
      }
      
      const url = await QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getEventIcon = () => {
    switch (ticket.eventType) {
      case 'flight':
        return <Plane className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getTicketStyles = () => {
    const baseStyles = "relative overflow-hidden bg-gradient-to-br";
    
    switch (variant) {
      case 'premium':
        return `${baseStyles} from-primary via-primary/90 to-primary/80 text-primary-foreground`;
      case 'compact':
        return `${baseStyles} from-background to-muted border`;
      default:
        return `${baseStyles} from-white to-gray-50 border shadow-lg`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-ZW', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-ZW', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDate(ticket.dateTime);

  return (
    <div className="space-y-4">
      {/* Main Ticket */}
      <Card 
        ref={ticketRef}
        className={cn(
          getTicketStyles(),
          variant === 'compact' ? 'p-4' : 'p-6',
          "max-w-md mx-auto"
        )}
      >
        {/* Decorative Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute inset-0 bg-primary/20 transform rotate-45 translate-x-16 -translate-y-16 rounded-full" />
          <div className="absolute inset-4 bg-primary/10 transform rotate-45 translate-x-16 -translate-y-16 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getEventIcon()}
              <span className="font-semibold text-sm text-muted-foreground">
                {ticket.eventType.toUpperCase()}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {ticket.ticketType}
            </Badge>
          </div>

          {/* Event Title */}
          <div className="space-y-1">
            <h2 className={cn(
              "font-bold leading-tight",
              variant === 'compact' ? 'text-lg' : 'text-xl'
            )}>
              {ticket.eventTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{ticket.organizerName}</p>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{date}</div>
                  <div className="text-xs text-muted-foreground">{time}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{ticket.venue}</div>
                  <div className="text-xs text-muted-foreground">{ticket.location}</div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-end">
              {qrCodeUrl && (
                <div className="bg-white p-2 rounded-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt="Ticket QR Code"
                    className="w-20 h-20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seat Information */}
          {ticket.seatInfo && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Seat Assignment</span>
                </div>
                <div className="text-right">
                  {ticket.seatInfo.section && (
                    <div className="text-xs text-muted-foreground">
                      Section {ticket.seatInfo.section}
                    </div>
                  )}
                  <div className="font-bold text-lg">
                    {ticket.seatInfo.row}{ticket.seatInfo.seat}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(ticket.boardingTime || ticket.gateInfo) && (
            <div className="space-y-2">
              {ticket.boardingTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Boarding: {ticket.boardingTime}</span>
                </div>
              )}
              {ticket.gateInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Gate: {ticket.gateInfo}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="text-muted-foreground">Ticket Holder</div>
              <div className="font-medium">{ticket.customerName}</div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Total</div>
              <div className="font-bold text-lg">
                {ticket.currency === 'USD' ? '$' : 
                 ticket.currency === 'ZWL' ? 'Z$' : 'RTGS$'}
                {ticket.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">Ticket #{ticket.ticketNumber || 'N/A'}</div>
            {ticket.specialInstructions && (
              <div className="text-xs text-muted-foreground mt-1 p-2 bg-yellow-50 rounded border">
                ⚠️ {ticket.specialInstructions}
              </div>
            )}
          </div>
        </div>

        {/* Perforation Effect */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-background rounded-r-full -translate-x-2" />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-background rounded-l-full translate-x-2" />
      </Card>

      {/* Action Buttons */}
      {showDownloadButton && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload?.('image')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Save Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload?.('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      )}

      {/* Mobile Optimization Notice */}
      <div className="text-center text-xs text-muted-foreground">
        📱 Optimized for WhatsApp & Email • Present this ticket at entry
      </div>
    </div>
  );
};