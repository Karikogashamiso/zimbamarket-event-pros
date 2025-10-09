import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export const CustomerBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          services(
            title,
            price_from,
            business_listings(
              business_name,
              phone_number,
              email
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: { bookingRequestId: bookingId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'approved' && paymentStatus === 'paid') {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed & Paid
        </Badge>
      );
    }
    if (status === 'approved') {
      return (
        <Badge variant="secondary" className="bg-blue-600 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved - Payment Pending
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
        <Clock className="w-3 h-3 mr-1" />
        Pending Review
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground">
            Your booking requests will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{booking.services?.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {booking.services?.business_listings?.business_name}
                </p>
              </div>
              {getStatusBadge(booking.status, booking.payment_status)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Event Date</p>
                <p className="font-medium">
                  {new Date(booking.event_date).toLocaleDateString()}
                </p>
              </div>
              
              {booking.total_amount && (
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold text-lg text-primary">
                    ${booking.total_amount}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-muted-foreground">Requested</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Payment Status</p>
                <p className="font-medium capitalize">{booking.payment_status}</p>
              </div>
            </div>

            {booking.message && (
              <div className="bg-muted/50 rounded p-3">
                <p className="text-sm text-muted-foreground mb-1">Your Message:</p>
                <p className="text-sm">{booking.message}</p>
              </div>
            )}

            {booking.status === 'approved' && booking.payment_status === 'pending' && (
              <div className="space-y-2">
                {!booking.total_amount && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                    <p className="text-sm text-blue-800">
                      ⏳ Waiting for provider to set the payment amount
                    </p>
                  </div>
                )}
                <Button 
                  className="w-full"
                  onClick={() => handlePayment(booking.id)}
                  disabled={!booking.total_amount}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {booking.total_amount 
                    ? `Pay Now $${booking.total_amount}` 
                    : 'Pay Now - Amount Pending'}
                </Button>
              </div>
            )}

            {booking.status === 'approved' && booking.payment_status === 'paid' && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Booking confirmed! The provider will contact you soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};