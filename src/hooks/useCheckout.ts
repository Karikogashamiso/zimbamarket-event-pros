import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useTicketGeneration } from './useTicketGeneration';

// Validation schemas
const customerInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().min(1, "Phone number is required").max(20, "Phone number must be less than 20 characters"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  specialRequests: z.string()
    .trim()
    .max(1000, "Special requests must be less than 1000 characters")
    .transform(val => val === '' ? undefined : val)
    .optional(),
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
    event_addons?: unknown[];
    ticket_types?: unknown[];
  };
  selectedSeats?: unknown[];
  ticketTiers?: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
  }>;
  addOns?: unknown[];
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
  const [orderDetails, setOrderDetails] = useState<unknown>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { generateTickets, isGenerating } = useTicketGeneration();

  const calculateTotal = (ticketTiers: {price: number; quantity: number}[], addOns: {price: number; quantity: number}[] = []) => {
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

  const createTickets = async (orderId: string, ticketTiers: {id: string; name: string; price: number; quantity: number}[], checkoutData: CheckoutData) => {
    console.log('Creating secure tickets with QR codes...');

    const generationOptions = {
      orderId,
      ticketTiers,
      customerInfo: checkoutData.customerInfo!,
      eventInfo: checkoutData.event,
    };

    // Use the enhanced ticket generation service
    const generatedTickets = await generateTickets(generationOptions);
    
    console.log(`Successfully generated ${generatedTickets.length} secure tickets`);
    return generatedTickets;
  };

  const processPayment = async (orderId: string, paymentMethod: string, amount: number, customerEmail: string, customerName: string) => {
    console.log('Processing payment:', { orderId, paymentMethod, amount });

    // For now, support non-Stripe payments (Ecocash, OneMoney, Bank Transfer)
    if (paymentMethod === 'card' || paymentMethod === 'stripe') {
      // Try Stripe payment
      try {
        const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('process-stripe-payment', {
          body: {
            orderId,
            amount,
            currency: 'USD',
            customerEmail,
            customerName,
            paymentMethod,
          }
        });

        if (paymentError || !paymentResult?.configured) {
          console.warn('Stripe not configured, creating pending payment');
          // Fall through to pending payment below
        } else {
          // Stripe payment successful
          const transactionData = {
            order_id: orderId,
            amount,
            currency: 'USD' as 'USD' | 'ZWL' | 'RTGS',
            transaction_type: 'payment',
            payment_method: paymentMethod,
            payment_provider: 'stripe',
            status: paymentResult.status === 'succeeded' ? 'completed' : 'pending' as 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded',
            provider_transaction_id: paymentResult.paymentIntentId,
            metadata: {
              processed_at: new Date().toISOString(),
              client_secret: paymentResult.clientSecret,
            },
          };

          const { data: transaction, error: transactionError } = await supabase
            .from('payment_transactions')
            .insert([transactionData])
            .select()
            .single();

          if (transactionError) {
            console.error('Payment transaction error:', transactionError);
            throw new Error(`Failed to record payment: ${transactionError.message}`);
          }

          console.log('Stripe payment processed:', transaction);
          return transaction;
        }
      } catch (error) {
        console.warn('Stripe payment failed, creating pending payment:', error);
        // Fall through to pending payment
      }
    }

    // Create pending payment transaction for non-Stripe methods
    const transactionData = {
      order_id: orderId,
      amount,
      currency: 'USD' as 'USD' | 'ZWL' | 'RTGS',
      transaction_type: 'payment',
      payment_method: paymentMethod,
      payment_provider: paymentMethod === 'ecocash' ? 'ecocash' : paymentMethod === 'onemoney' ? 'onemoney' : 'manual',
      status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded',
      metadata: {
        processed_at: new Date().toISOString(),
        note: 'Awaiting payment confirmation',
      },
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      console.error('Payment transaction error:', transactionError);
      throw new Error(`Failed to record payment: ${transactionError.message}`);
    }

    console.log('Pending payment transaction created:', transaction);
    return transaction;
  };

  const updateOrderStatus = async (orderId: string, status: 'confirmed' | 'cancelled' | 'failed') => {
    const updates: Record<string, unknown> = {
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

      // Step 2: Create tickets with secure QR codes
      await createTickets(order.id, checkoutData.ticketTiers!, checkoutData);

      // Fetch complete ticket records from database
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('order_id', order.id);

      if (ticketsError || !tickets) {
        throw new Error('Failed to fetch generated tickets');
      }

      console.log('Fetched complete tickets:', tickets);

      // Step 3: Process payment
      const payment = await processPayment(
        order.id, 
        checkoutData.paymentMethod!, 
        checkoutData.totalAmount!,
        checkoutData.customerInfo!.email,
        `${checkoutData.customerInfo!.firstName} ${checkoutData.customerInfo!.lastName}`
      );

      // Step 4: Update order status based on payment
      const orderStatus = payment.status === 'completed' ? 'confirmed' : 'pending';
      const paymentStatus = payment.status === 'completed' ? 'completed' : 'pending';
      
      await updateOrderStatus(order.id, orderStatus as any);

      // Update payment status separately
      await supabase
        .from('orders')
        .update({ payment_status: paymentStatus as any })
        .eq('id', order.id);

      // Step 5: Set final order details
      const finalOrderDetails = {
        ...order,
        tickets,
        payment,
        booking_status: orderStatus,
        payment_status: paymentStatus,
      };

      setOrderDetails(finalOrderDetails);

      // Step 6: Send order confirmation email
      try {
        console.log('Sending order confirmation email...');
        const emailResponse = await supabase.functions.invoke('send-order-confirmation', {
          body: { orderDetails: finalOrderDetails }
        });

        if (emailResponse.error) {
          console.warn('Failed to send confirmation email:', emailResponse.error);
          // Don't fail the entire checkout for email issues
        } else {
          console.log('Order confirmation email sent successfully');
        }
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't fail the entire checkout for email issues
      }

      const toastMessage = payment.status === 'completed' 
        ? `Your order ${order.order_number} has been confirmed. Check your email for tickets.`
        : `Your order ${order.order_number} has been created. Complete payment to activate your tickets.`;

      toast({
        title: payment.status === 'completed' ? "Booking Confirmed!" : "Order Created",
        description: toastMessage,
      });

      return finalOrderDetails;

    } catch (error: unknown) {
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
    isProcessing: isProcessing || isGenerating,
    orderDetails,
    processCheckout,
    validateCheckoutData,
    calculateTotal,
  };
};