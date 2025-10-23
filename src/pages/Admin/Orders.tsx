import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          tickets(id, ticket_number, ticket_status)
        `)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendTickets = async (orderId: string, customerEmail: string) => {
    try {
      // Fetch complete order details with tickets and ticket types
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          tickets(
            *,
            ticket_types(name)
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Order not found');

      // Format tickets with ticket type names
      const formattedTickets = orderData.tickets?.map((ticket: any) => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        ticket_type_name: ticket.ticket_types?.name || 'General Admission',
        qr_code_data: ticket.qr_code_data
      })) || [];

      // Send order confirmation email with full details
      const { error } = await supabase.functions.invoke('send-order-confirmation', {
        body: { 
          orderDetails: {
            ...orderData,
            tickets: formattedTickets
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Tickets Resent",
        description: `Tickets have been sent to ${customerEmail}`,
      });
    } catch (error: any) {
      console.error('Error resending tickets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend tickets.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'ZWL' ? 'Z$' : 'RTGS$';
    return `${symbol}${amount}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">View and manage customer bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium font-mono">{order.order_number}</TableCell>
                      <TableCell>{order.customer_first_name} {order.customer_last_name}</TableCell>
                      <TableCell className="text-sm">{order.customer_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.tickets?.length || 0} ticket{order.tickets?.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total_amount, order.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            order.booking_status === 'confirmed' || order.booking_status === 'completed' 
                              ? 'default' 
                              : order.booking_status === 'cancelled' 
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {order.booking_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendTickets(order.id, order.customer_email)}
                          disabled={!order.tickets || order.tickets.length === 0}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Resend
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
