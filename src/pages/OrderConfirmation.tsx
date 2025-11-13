import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TicketDisplay } from '@/components/Tickets/TicketDisplay';
import { CheckCircle, Mail, ArrowLeft, Home, Download, Share2, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MetaTags from '@/components/SEO/MetaTags';
import jsPDF from 'jspdf';

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderNumber) {
        setError('Order number not provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order details for:', orderNumber);
        
        // Check if returning from Stripe payment
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        
        let order = null;

        if (paymentStatus === 'success' && !verificationAttempted) {
          console.log('Payment successful, verifying with Stripe...');
          setVerificationAttempted(true);
          
          try {
            // Verify payment and update order status
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: { orderNumber }
            });

            if (verifyError) {
              console.error('Payment verification error:', verifyError);
              toast.error('Failed to verify payment. Please contact support.');
            } else if (verifyData?.success && verifyData?.order) {
              console.log('Payment verified and order updated');
              toast.success('Payment confirmed! Your order has been processed.');
              
              // Use the order data from verification response to avoid RLS issues
              order = verifyData.order;
            }
          } catch (verifyErr) {
            console.error('Verification request failed:', verifyErr);
          }
          
          // Clear the payment parameter from URL to prevent re-verification
          window.history.replaceState({}, '', `/order-confirmation/${orderNumber}`);
        }
        
        // Only fetch from DB if we don't already have order data from verification
        if (!order) {
          const { data: fetchedOrder, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .maybeSingle();

          if (orderError) {
            console.error('Error fetching order:', orderError);
            setError('Unable to load order. Please check your email for confirmation.');
            setLoading(false);
            return;
          }
          
          if (!fetchedOrder) {
            console.error('Order not found');
            setError('Order not found. Please check your email for confirmation.');
            setLoading(false);
            return;
          }
          
          order = fetchedOrder;
        }

        // Fetch tickets for this order
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            *,
            ticket_types (
              name,
              description,
              event_id
            )
          `)
          .eq('order_id', order.id);

        if (ticketsError) {
          console.warn('Failed to fetch tickets:', ticketsError);
        }

        const enrichedOrder = {
          ...order,
          tickets: tickets?.map(ticket => ({
            ...ticket,
            ticket_type_name: ticket.ticket_types?.name || 'General Admission'
          })) || []
        };

        setOrderDetails(enrichedOrder);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber]);

  // Real-time subscription for order status updates (ContiPay webhook updates)
  useEffect(() => {
    if (!orderDetails?.id) return;

    console.log('Setting up real-time subscription for order:', orderDetails.id);
    console.log('Current payment status:', orderDetails.payment_status);

    const channel = supabase
      .channel(`order-${orderDetails.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderDetails.id}`
        },
        (payload) => {
          console.log('🔔 Webhook Update Received:', payload.new);
          const updatedOrder = payload.new;

          // Show toast notification when payment status changes
          if (updatedOrder.payment_status === 'completed' && orderDetails.payment_status !== 'completed') {
            console.log('✅ Payment Status: COMPLETED');
            toast.success('Payment confirmed! Your order has been processed.');
          } else if (updatedOrder.payment_status === 'failed' && orderDetails.payment_status !== 'failed') {
            console.log('❌ Payment Status: FAILED');
            toast.error('Payment failed. Please try again or contact support.');
          } else if (updatedOrder.payment_status === 'pending') {
            console.log('⏳ Payment Status: PENDING');
          }

          // Update order details
          setOrderDetails((prev: any) => ({
            ...prev,
            ...updatedOrder
          }));
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [orderDetails?.id, orderDetails?.payment_status]);

  // Polling backup for pending payments - max 3 attempts
  useEffect(() => {
    if (!orderDetails?.id || orderDetails?.payment_status !== 'pending') {
      console.log('Polling not started:', { 
        hasId: !!orderDetails?.id, 
        status: orderDetails?.payment_status 
      });
      return;
    }

    console.log('Starting payment status polling for pending order (max 3 attempts)');
    let pollCount = 0;
    const maxPolls = 3;
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`🔄 Polling payment status... (attempt ${pollCount}/${maxPolls})`);
      
      try {
        const { data: updatedOrder, error } = await supabase
          .from('orders')
          .select('payment_status, booking_status')
          .eq('id', orderDetails.id)
          .single();

        if (!error && updatedOrder) {
          console.log('📊 Polled status:', {
            payment_status: updatedOrder.payment_status,
            booking_status: updatedOrder.booking_status,
            previous_status: orderDetails.payment_status,
          });
          
          if (updatedOrder.payment_status !== orderDetails.payment_status) {
            console.log('🔄 Payment status changed via polling:', updatedOrder.payment_status);
            
            if (updatedOrder.payment_status === 'completed') {
              console.log('✅ Payment COMPLETED via polling');
              toast.success('Payment confirmed! Your order has been processed.');
            } else if (updatedOrder.payment_status === 'failed') {
              console.log('❌ Payment FAILED via polling');
              toast.error('Payment failed. Please try again or contact support.');
            }
            
            setOrderDetails((prev: any) => ({
              ...prev,
              ...updatedOrder
            }));
            
            // Stop polling once status changes
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('❌ Error polling payment status:', err);
      }
      
      // Stop polling after 3 attempts
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        console.log('⏹️ Payment polling stopped after 3 attempts');
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      console.log('Stopping payment polling');
      clearInterval(pollInterval);
    };
  }, [orderDetails?.id, orderDetails?.payment_status]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'ZWL' ? 'Z$' : 'RTGS$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const generateInvoicePDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Add logo if available
      const logoUrl = '/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png';
      try {
        // Try to load and add logo
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 2000); // Timeout after 2 seconds
        });
        doc.addImage(img, 'PNG', 20, 10, 30, 15);
      } catch {
        // Logo load failed, continue without it
        console.log('Logo not loaded, continuing without image');
      }
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text('ZimEventPro', 55, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Invoice', 20, 40);
      
      // Order details
      doc.setFontSize(10);
      doc.text(`Order Number: ${orderDetails.order_number}`, 20, 55);
      doc.text(`Date: ${new Date(orderDetails.created_at).toLocaleDateString()}`, 20, 62);
      doc.text(`Payment Status: ${orderDetails.payment_status}`, 20, 69);
      
      // Customer details
      doc.setFontSize(12);
      doc.text('Bill To:', 20, 85);
      doc.setFontSize(10);
      doc.text(`${orderDetails.customer_first_name} ${orderDetails.customer_last_name}`, 20, 92);
      doc.text(orderDetails.customer_email, 20, 99);
      if (orderDetails.customer_phone) {
        doc.text(orderDetails.customer_phone, 20, 106);
      }
      
      // Event details if available
      let yPos = 120;
      if (orderDetails.metadata?.event) {
        doc.setFontSize(12);
        doc.text('Event Details:', 20, yPos);
        doc.setFontSize(10);
        yPos += 7;
        doc.text(`Event: ${orderDetails.metadata.event.title}`, 20, yPos);
        yPos += 7;
        if (orderDetails.metadata.event.date) {
          doc.text(`Date: ${orderDetails.metadata.event.date}`, 20, yPos);
          yPos += 7;
        }
        if (orderDetails.metadata.event.venue) {
          doc.text(`Venue: ${orderDetails.metadata.event.venue}`, 20, yPos);
          yPos += 7;
        }
      }
      
      yPos += 10;
      
      // Tickets table
      doc.setFontSize(12);
      doc.text('Tickets:', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text('Description', 20, yPos);
      doc.text('Quantity', 100, yPos);
      doc.text('Amount', 160, yPos);
      yPos += 7;
      
      // Draw line
      doc.line(20, yPos, 190, yPos);
      yPos += 7;
      
      // Tickets
      if (orderDetails.tickets && orderDetails.tickets.length > 0) {
        orderDetails.tickets.forEach((ticket: any) => {
          doc.text(ticket.ticket_type_name || 'Ticket', 20, yPos);
          doc.text('1', 100, yPos);
          doc.text(formatCurrency(ticket.price || 0, orderDetails.currency), 160, yPos);
          yPos += 7;
        });
      } else {
        doc.text('Order Items', 20, yPos);
        doc.text('-', 100, yPos);
        doc.text(formatCurrency(orderDetails.subtotal, orderDetails.currency), 160, yPos);
        yPos += 7;
      }
      
      yPos += 5;
      doc.line(20, yPos, 190, yPos);
      yPos += 7;
      
      // Subtotal
      doc.text('Subtotal:', 120, yPos);
      doc.text(formatCurrency(orderDetails.subtotal, orderDetails.currency), 160, yPos);
      yPos += 7;
      
      // Service fee
      if (orderDetails.service_fee > 0) {
        doc.text('Service Fee:', 120, yPos);
        doc.text(formatCurrency(orderDetails.service_fee, orderDetails.currency), 160, yPos);
        yPos += 7;
      }
      
      // Tax
      if (orderDetails.tax_amount > 0) {
        doc.text('Tax:', 120, yPos);
        doc.text(formatCurrency(orderDetails.tax_amount, orderDetails.currency), 160, yPos);
        yPos += 7;
      }
      
      // Total
      doc.setFontSize(12);
      doc.text('Total:', 120, yPos);
      doc.text(formatCurrency(orderDetails.total_amount, orderDetails.currency), 160, yPos);
      
      // Footer
      yPos = 270;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
      doc.text('For support, contact: support@zimeventpro.com', 105, yPos + 5, { align: 'center' });
      
      // Save PDF
      doc.save(`Invoice-${orderDetails.order_number}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice PDF');
    }
  };

  const handleTicketDownload = (ticketId: string, format: 'pdf' | 'image') => {
    toast.success(`${format.toUpperCase()} download will be implemented with payment integration`);
  };

  const handleTicketShare = (ticketId: string, method: 'email' | 'whatsapp') => {
    toast.success(`Ticket shared via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
  };

  const handleEmailInvoice = async () => {
    try {
      toast.loading('Sending invoice email...', { id: 'email-invoice' });
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { orderNumber: orderDetails.order_number }
      });

      if (error) throw error;

      toast.success('Invoice email sent successfully!', { id: 'email-invoice' });
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      toast.error('Failed to send invoice email. Please try again.', { id: 'email-invoice' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p>Loading your order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <MetaTags
          title="Order Not Found - ZimEventPro"
          description="The requested order could not be found."
        />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <div className="text-red-600 text-2xl">!</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h1>
              <p className="text-muted-foreground">
                {error || 'The order you are looking for could not be found.'}
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <MetaTags
        title={`Order Confirmation - ${orderDetails.order_number} - ZimEventPro`}
        description={`Your booking has been confirmed. Order ${orderDetails.order_number} details and tickets.`}
      />
      
      {/* Header */}
      <div className="bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Order Confirmation</h1>
              <p className="text-sm text-muted-foreground">
                Your booking has been confirmed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Icon */}
          <div className="text-center">
            {orderDetails.payment_status === 'pending' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                </div>
                <h2 className="text-2xl font-bold text-yellow-600 mb-2">Payment Processing...</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment. This page will update automatically.
                </p>
              </>
            ) : orderDetails.payment_status === 'completed' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your booking has been successfully processed
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <div className="text-red-600 text-2xl">✕</div>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Payment {orderDetails.payment_status === 'failed' ? 'Failed' : orderDetails.payment_status}</h2>
                <p className="text-muted-foreground mb-4">
                  {orderDetails.payment_status === 'failed' 
                    ? 'Your payment could not be processed. Please try again or use a different payment method.'
                    : 'Please contact support if you need assistance'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate(`/checkout?eventId=${orderDetails.tickets?.[0]?.ticket_types?.event_id || ''}`)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Return Home
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Order Details Card */}
          <Card>
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
                  <Badge 
                    className={
                      orderDetails.payment_status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : orderDetails.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
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

              {/* Event Information */}
              {orderDetails.metadata?.event && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Event Details:</p>
                    <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                      <p className="font-medium">{orderDetails.metadata.event.title}</p>
                      {orderDetails.metadata.event.date && (
                        <p className="text-sm text-muted-foreground">Date: {orderDetails.metadata.event.date}</p>
                      )}
                      {orderDetails.metadata.event.venue && (
                        <p className="text-sm text-muted-foreground">Venue: {orderDetails.metadata.event.venue}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Tickets Display */}
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

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={generateInvoicePDF}
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleEmailInvoice}
              >
                <Share2 className="h-4 w-4" />
                Email Invoice
              </Button>
            </div>

            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>

          {/* Help Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
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
      </div>
    </div>
  );
};