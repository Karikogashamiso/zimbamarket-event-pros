import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BookingPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const booking_id = searchParams.get('booking_id');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<unknown>(null);
  const { toast } = useToast();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!booking_id) {
        setLoading(false);
        return;
      }

      try {
        // Update payment status via edge function (has proper permissions)
        const { error: confirmError } = await supabase.functions.invoke('confirm-booking-payment', {
          body: { bookingRequestId: booking_id },
        });

        if (confirmError) throw confirmError;

        // Fetch booking details
        const { data, error: fetchError } = await supabase
          .from('booking_requests')
          .select(`
            *,
            services(
              title,
              business_listings(
                business_name
              )
            )
          `)
          .eq('id', booking_id)
          .single();

        if (fetchError) throw fetchError;
        
        setBooking(data);
        
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed.",
        });
      } catch (error: unknown) {
        console.error('Error updating payment:', error);
        toast({
          title: "Error",
          description: "Failed to confirm payment",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    updatePaymentStatus();
  }, [booking_id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking_id || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We couldn't find the booking information.
            </p>
            <Link to="/profile?tab=bookings">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5">
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-500/20 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">
                Payment Successful!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Your booking has been confirmed
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{booking.services?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium">
                        {booking.services?.business_listings?.business_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Date:</span>
                      <span className="font-medium">
                        {new Date(booking.event_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-muted-foreground font-semibold">Amount Paid:</span>
                      <span className="font-bold text-lg text-primary">
                        ${booking.total_amount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded p-4 border">
                  <p className="text-sm text-muted-foreground">
                    <strong>What's Next?</strong><br />
                    The service provider will contact you to finalize the details.
                    You can view your booking status in your profile.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/profile?tab=bookings" className="block">
                  <Button className="w-full" size="lg">
                    View My Bookings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentSuccess;