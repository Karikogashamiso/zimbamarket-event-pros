import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOrderCreation } from './useOrderCreation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  currency?: string;
}

export const useSimpleCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createOrder, loading: orderLoading } = useOrderCreation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);

    try {
      console.log('Processing simple checkout:', checkoutData);
      console.log('Ticket tiers:', checkoutData.ticketTiers);

      // Validate required data
      if (!checkoutData.customerInfo || !checkoutData.ticketTiers || checkoutData.ticketTiers.length === 0) {
        throw new Error('Missing required checkout information');
      }

      // Check if user is trying to buy tickets for their own event
      if (user && checkoutData.event?.id) {
        const { data: eventOwnership, error: ownershipError } = await supabase
          .rpc('user_owns_event', {
            event_id_param: checkoutData.event.id,
            user_id_param: user.id
          });

        if (ownershipError) {
          console.error('Error checking event ownership:', ownershipError);
        }

        if (eventOwnership === true) {
          throw new Error('Event organizers cannot purchase tickets for their own events');
        }
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
        payment_method: checkoutData.paymentMethod || 'card',
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', order);

      // Process payment through Stripe if card payment selected
      if (checkoutData.paymentMethod === 'card') {
        console.log('Creating Stripe Checkout session...');
        
        const { data: checkoutSession, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            orderId: order.id,
            orderNumber: order.order_number,
            customerEmail: checkoutData.customerInfo.email,
            totalAmount: checkoutData.totalAmount || 0,
            currency: checkoutData.currency || 'USD',
          }
        });

        console.log('Checkout session response:', { checkoutSession, checkoutError });

        if (checkoutError) {
          console.error('Checkout session error details:', {
            message: checkoutError.message,
            details: checkoutError,
          });
          throw new Error(`Payment session failed: ${checkoutError.message || 'Please try again.'}`);
        }

        if (checkoutSession?.error) {
          console.error('Checkout session returned error:', checkoutSession.error);
          throw new Error(`Payment error: ${checkoutSession.error}`);
        }

        if (!checkoutSession?.configured) {
          toast({
            title: "Payment Not Configured",
            description: "Stripe is not configured. Order created with pending payment.",
          });
          navigate(`/order-confirmation/${order.order_number}`);
          return order;
        }

        if (!checkoutSession?.url) {
          throw new Error('Invalid checkout session response');
        }

        console.log('Redirecting to Stripe Checkout:', checkoutSession.url);

        // Redirect to Stripe Checkout with a small delay to ensure state is clean
        setTimeout(() => {
          window.location.href = checkoutSession.url;
        }, 100);
        
        return order;
      }

      // Process payment through ContiPay
      if (checkoutData.paymentMethod === 'contipay') {
        console.log('Creating ContiPay payment...');
        
        toast({
          title: "Redirecting to Payment",
          description: "Please wait while we redirect you to ContiPay...",
        });

        const { data: contiPayResponse, error: contiPayError } = await supabase.functions.invoke('process-contipay-payment', {
          body: {
            orderId: order.id,
            orderNumber: order.order_number,
            amount: checkoutData.totalAmount || 0,
            currency: checkoutData.currency || 'USD',
            customerInfo: checkoutData.customerInfo,
            returnUrl: `${window.location.origin}/order-confirmation/${order.order_number}`,
          }
        });

        console.log('ContiPay raw response:', { contiPayResponse, contiPayError });

        // Handle function invocation error (network/server issues)
        if (contiPayError) {
          console.error('ContiPay function error:', contiPayError);
          
          const errorMessage = contiPayError?.message || 'Payment service unavailable';
          
          toast({
            title: "ContiPay Payment Failed",
            description: "The payment gateway is currently unavailable. Your order has been created but payment is pending. Please contact support with order number: " + order.order_number,
            variant: "destructive",
          });
          
          throw new Error(`ContiPay connection failed: ${errorMessage}`);
        }

        // Handle ContiPay API error response
        if (!contiPayResponse?.success) {
          const errorDetail = contiPayResponse?.error || 'Payment processing failed';
          console.error('ContiPay API error:', errorDetail);
          
          // Show user-friendly error message
          toast({
            title: "Payment Gateway Error",
            description: `ContiPay is experiencing issues. Your order #${order.order_number} has been created but payment is pending. Please try again later or contact support.`,
            variant: "destructive",
          });
          
          throw new Error(`ContiPay error: ${errorDetail}`);
        }

        // Validate payment URL exists
        if (!contiPayResponse.paymentUrl) {
          console.error('ContiPay missing payment URL:', contiPayResponse);
          
          toast({
            title: "Payment Setup Failed",
            description: `Unable to generate payment link. Order #${order.order_number} created. Please contact support to complete payment.`,
            variant: "destructive",
          });
          
          throw new Error('ContiPay did not return a payment URL');
        }

        // If payment initiation failed and is pending, show confirmation page with pending status
        if (contiPayResponse.pending) {
          toast({
            title: "Payment Processing",
            description: "Your payment is being processed. Status will update automatically.",
          });
          navigate(`/order-confirmation/${order.order_number}`);
        } else if (contiPayResponse.paymentUrl) {
          // Redirect directly to ContiPay payment page
          console.log('Redirecting to ContiPay:', contiPayResponse.paymentUrl);
          toast({
            title: "Redirecting to Payment",
            description: "Completing your payment...",
          });
          window.location.href = contiPayResponse.paymentUrl;
        } else {
          throw new Error('ContiPay did not return a payment URL or pending status');
        }
        
        return order;
      }

      // For non-card payments, go directly to confirmation
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
