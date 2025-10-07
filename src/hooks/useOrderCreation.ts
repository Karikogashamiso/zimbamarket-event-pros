import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  ticket_type_id: string;
  quantity: number;
  seat_id?: string;
}

interface CreateOrderData {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  payment_method?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  order_status: string;
  payment_status: string;
  tickets: any[];
  ticket_count: number;
}

export const useOrderCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Creating order via API...');
      
      const { data, error: functionError } = await supabase.functions.invoke('create-order', {
        body: orderData,
      });

      if (functionError) {
        console.error('Order creation error:', functionError);
        const errorMessage = functionError.message || 'Failed to create order';
        setError(errorMessage);
        toast({
          title: "Order Creation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        const errorMessage = data.error || 'Failed to create order';
        setError(errorMessage);
        toast({
          title: "Order Creation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      console.log('Order created successfully:', data.order);
      
      toast({
        title: "Order Created Successfully",
        description: `Order #${data.order.order_number} created with ${data.order.ticket_count} ticket(s)`,
      });

      return data.order;
    } catch (err: any) {
      console.error('Unexpected error:', err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    loading,
    error,
  };
};
