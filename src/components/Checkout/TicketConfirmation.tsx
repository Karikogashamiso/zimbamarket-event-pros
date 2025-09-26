import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TicketDisplay } from '@/components/Tickets/TicketDisplay';
import { CheckCircle, Download, Mail, MessageSquare, Share2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface TicketConfirmationProps {
  orderDetails: any;
}

export const TicketConfirmation: React.FC<TicketConfirmationProps> = ({ orderDetails }) => {
  if (!orderDetails) {
    return (
      <div className="text-center space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p>Loading confirmation details...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'ZWL' ? 'Z$' : 'RTGS$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const handleTicketDownload = (ticketId: string, format: 'pdf' | 'image') => {
    // In a real implementation, this would trigger actual PDF/image generation
    toast.success(`${format.toUpperCase()} download will be implemented with payment integration`);
  };

  const handleTicketShare = (ticketId: string, method: 'email' | 'whatsapp') => {
    toast.success(`Ticket shared via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      {/* Confirmation Header */}
      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your booking has been successfully processed
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono font-semibold">{orderDetails.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(orderDetails.total_amount, orderDetails.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {orderDetails.payment_status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booking Status</p>
              <Badge className="bg-blue-100 text-blue-800">
                {orderDetails.booking_status}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Confirmation sent to:</p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-medium">{orderDetails.customer_email}</span>
            </div>
          </div>

          {/* Enhanced Tickets Display */}
          {orderDetails.tickets && orderDetails.tickets.length > 0 && (
            <>
              <Separator />
              <TicketDisplay
                orderDetails={orderDetails}
                tickets={orderDetails.tickets}
                onDownload={handleTicketDownload}
                onShare={handleTicketShare}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons - Only show if no tickets to avoid duplication */}
      {(!orderDetails.tickets || orderDetails.tickets.length === 0) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Booking
            </Button>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = `/order-confirmation/${orderDetails.order_number}`}
              variant="outline"
              className="w-full"
            >
              View Full Order Details
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200 text-left">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-2">
                If you have any questions about your booking or need to make changes:
              </p>
              <div className="text-sm text-blue-600">
                <p>📧 Email: support@zimeventpro.com</p>
                <p>📱 WhatsApp: +263 77 123 4567</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};