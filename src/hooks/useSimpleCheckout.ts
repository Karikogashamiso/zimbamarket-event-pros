import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOrderCreation } from './useOrderCreation';

interface TicketTier {
  ticketTypeId: string;
  name: string;
  quantity: number;
  price: number;
}

interface CheckoutData {
  event?: {
    id: string;
    title: string;
    venue: string;
  };
  ticketTiers?: TicketTier[];
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod?: string;
  totalAmount?: number;
}

export const useSimpleCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createOrder, loading: orderLoading } = useOrderCreation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);

    try {
      console.log('Processing simple checkout:', checkoutData);
      console.log('Ticket tiers:', checkoutData.ticketTiers);

      // Validate required data
      if (!checkoutData.customerInfo || !checkoutData.ticketTiers || checkoutData.ticketTiers.length === 0) {
        throw new Error('Missing required checkout information');
      }

      // Prepare order items from ticket tiers
      const items = checkoutData.ticketTiers.map(tier => {
        console.log('Mapping tier:', tier);
        return {
          ticket_type_id: tier.ticketTypeId,
          quantity: tier.quantity,
        };
      });
      
      console.log('Prepared items for order:', items);

      // Create order using the order creation hook
      const order = await createOrder({
        customer_first_name: checkoutData.customerInfo.firstName,
        customer_last_name: checkoutData.customerInfo.lastName,
        customer_email: checkoutData.customerInfo.email,
        customer_phone: checkoutData.customerInfo.phone,
        items,
        payment_method: checkoutData.paymentMethod || 'pending',
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', order);

      // Navigate to order confirmation page
      navigate(`/order-confirmation/${order.order_number}`);

      return order;

    } catch (error: any) {
      console.error('Checkout failed:', error);
      
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to complete your booking. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing: isProcessing || orderLoading,
  };
};
