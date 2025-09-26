import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Validation schemas
const customerInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  specialRequests: z.string().max(1000, "Special requests must be less than 1000 characters").optional(),
  marketingConsent: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

const ticketTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  currency: z.string(),
  quantity: z.number().int().positive().max(10),
});

const checkoutDataSchema = z.object({
  event: z.object({
    id: z.string(),
    title: z.string(),
    venue: z.string().optional(),
    date: z.string().optional(),
  }),
  selectedSeats: z.array(z.any()).optional(),
  ticketTiers: z.array(ticketTierSchema).min(1, "At least one ticket must be selected"),
  addOns: z.array(z.any()).optional(),
  customerInfo: customerInfoSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
  totalAmount: z.number().positive(),
  currency: z.string(),
});

export interface CheckoutData {
  event?: {
    id: string;
    title: string;
    type?: 'event' | 'transport';
    category?: string;
    date?: string;
    time?: string;
    venue?: string;
    location?: string;
    price_from?: number;
    currency?: string;
    capacity?: number;
    available?: number;
    image?: string;
    featured?: boolean;
  };
  selectedSeats?: any[];
  ticketTiers?: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
  }>;
  addOns?: any[];
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    specialRequests?: string;
    marketingConsent: boolean;
    termsAccepted: boolean;
  };
  paymentMethod?: string;
  totalAmount?: number;
  currency?: string;
}

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const calculateTotal = (ticketTiers: any[], addOns: any[] = []) => {
    const ticketTotal = ticketTiers.reduce((sum, tier) => sum + (tier.price * tier.quantity), 0);
    const addOnTotal = addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    return ticketTotal + addOnTotal;
  };

  const validateCheckoutData = (data: CheckoutData) => {
    try {
      checkoutDataSchema.parse(data);
      return { isValid: true, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  };

  const createOrder = async (checkoutData: CheckoutData) => {
    if (!checkoutData.customerInfo || !checkoutData.ticketTiers) {
      throw new Error('Missing required checkout data');
    }

    // Generate unique order number
    const orderNumber = `ZEP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate totals
    const subtotal = calculateTotal(checkoutData.ticketTiers, checkoutData.addOns);
    const taxAmount = 0; // No tax for now
    const serviceFee = subtotal * 0.05; // 5% service fee
    const totalAmount = subtotal + taxAmount + serviceFee;

    const orderData = {
      user_id: user?.id || null,
      order_number: orderNumber,
      customer_email: checkoutData.customerInfo.email,
      customer_phone: checkoutData.customerInfo.phone,
      customer_first_name: checkoutData.customerInfo.firstName,
      customer_last_name: checkoutData.customerInfo.lastName,
      subtotal,
      tax_amount: taxAmount,
      service_fee: serviceFee,
      total_amount: totalAmount,
      currency: (checkoutData.currency || 'USD') as 'USD' | 'ZWL' | 'RTGS',
      booking_status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in',
      payment_status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded',
      booking_source: 'web',
      special_requests: checkoutData.customerInfo.specialRequests || null,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      metadata: {
        event: checkoutData.event,
        customerInfo: {
          country: checkoutData.customerInfo.country,
          city: checkoutData.customerInfo.city,
          marketingConsent: checkoutData.customerInfo.marketingConsent,
        },
        paymentMethod: checkoutData.paymentMethod,
        addOns: checkoutData.addOns || [],
      },
    };

    console.log('Creating order with data:', orderData);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('Order created:', order);
    return order;
  };

  const createTickets = async (orderId: string, ticketTiers: any[]) => {
    const tickets = [];

    for (const tier of ticketTiers) {
      for (let i = 0; i < tier.quantity; i++) {
        const ticketNumber = `${orderId.substr(0, 8)}-${tier.id.toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
        const qrCodeData = JSON.stringify({
          orderId,
          ticketNumber,
          tier: tier.id,
          timestamp: Date.now(),
        });

        const ticketData = {
          order_id: orderId,
          ticket_type_id: tier.id, // This should map to actual ticket_types in your DB
          ticket_number: ticketNumber,
          original_price: tier.price,
          paid_price: tier.price,
          currency: tier.currency,
          ticket_status: 'valid',
          qr_code_data: qrCodeData,
          holder_first_name: null, // Will be set when assigned
          holder_last_name: null,
          holder_email: null,
          holder_phone: null,
          metadata: {
            tierName: tier.name,
            position: i + 1,
          },
        };

        tickets.push(ticketData);
      }
    }

    console.log('Creating tickets:', tickets);

    const { data: createdTickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(tickets)
      .select();

    if (ticketsError) {
      console.error('Tickets creation error:', ticketsError);
      throw new Error(`Failed to create tickets: ${ticketsError.message}`);
    }

    console.log('Tickets created:', createdTickets);
    return createdTickets;
  };

  const processPayment = async (orderId: string, paymentMethod: string, amount: number) => {
    // Mock payment processing - in real implementation, this would integrate with payment providers
    console.log('Processing payment:', { orderId, paymentMethod, amount });

    const paymentData = {
      order_id: orderId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_type: paymentMethod,
      status: 'succeeded' as 'succeeded' | 'pending' | 'failed', // Mock successful payment
      metadata: {
        payment_method: paymentMethod,
        processed_at: new Date().toISOString(),
      },
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error(`Failed to process payment: ${paymentError.message}`);
    }

    // Create payment transaction record
    const transactionData = {
      order_id: orderId,
      amount,
      currency: 'USD' as 'USD' | 'ZWL' | 'RTGS',
      transaction_type: 'payment',
      payment_method: paymentMethod,
      payment_provider: paymentMethod === 'visa' ? 'stripe' : paymentMethod,
      status: 'completed' as 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded',
      provider_transaction_id: `mock_${Date.now()}`,
      metadata: {
        processed_at: new Date().toISOString(),
        mock_payment: true,
      },
    };

    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert([transactionData]);

    if (transactionError) {
      console.warn('Transaction record creation failed:', transactionError);
      // Don't fail the whole process for this
    }

    console.log('Payment processed:', payment);
    return payment;
  };

  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'cancelled' | 'failed') => {
    const updates: any = {
      booking_status: status as 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in',
      updated_at: new Date().toISOString(),
    };

    if (status === 'confirmed') {
      updates.payment_status = 'completed' as 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled' || status === 'failed') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Order status update error:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  };

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);

    try {
      // Validate data
      const validation = validateCheckoutData(checkoutData);
      if (!validation.isValid) {
        throw new Error('Invalid checkout data: ' + Object.values(validation.errors || {}).join(', '));
      }

      console.log('Starting checkout process with data:', checkoutData);

      // Step 1: Create order
      const order = await createOrder(checkoutData);

      // Step 2: Create tickets
      const tickets = await createTickets(order.id, checkoutData.ticketTiers!);

      // Step 3: Process payment
      const payment = await processPayment(
        order.id, 
        checkoutData.paymentMethod!, 
        checkoutData.totalAmount!
      );

      // Step 4: Update order status to confirmed
      await updateOrderStatus(order.id, 'confirmed');

      // Step 5: Set final order details
      const finalOrderDetails = {
        ...order,
        tickets,
        payment,
        booking_status: 'confirmed',
        payment_status: 'paid',
      };

      setOrderDetails(finalOrderDetails);

      toast({
        title: "Booking Confirmed!",
        description: `Your order ${order.order_number} has been confirmed. Check your email for tickets.`,
      });

      return finalOrderDetails;

    } catch (error: any) {
      console.error('Checkout process failed:', error);
      
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to complete your booking. Please try again.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    orderDetails,
    processCheckout,
    validateCheckoutData,
    calculateTotal,
  };
};