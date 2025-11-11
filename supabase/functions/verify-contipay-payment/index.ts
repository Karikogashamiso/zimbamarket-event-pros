import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload = await req.json();
    console.log('ContiPay webhook received:', JSON.stringify(payload, null, 2));
    console.log('Webhook headers:', Object.fromEntries(req.headers.entries()));

    // ContiPay API configuration
    const CONTIPAY_SECRET_KEY = Deno.env.get('CONTIPAY_SECRET_KEY');

    // Verify webhook signature if ContiPay provides one
    const signature = req.headers.get('X-ContiPay-Signature') || req.headers.get('x-contipay-signature');
    if (signature && CONTIPAY_SECRET_KEY) {
      console.log('Webhook signature verification enabled');
      // TODO: Implement signature verification based on ContiPay documentation
      // Example: const isValid = verifySignature(payload, signature, CONTIPAY_SECRET_KEY);
      // if (!isValid) throw new Error('Invalid webhook signature');
    } else {
      console.log('Webhook signature verification skipped (no signature or secret key)');
    }

    // Extract data from payload (adapt based on actual ContiPay webhook format)
    const orderId = payload.reference || payload.order_id || payload.merchant_reference;
    const paymentStatus = (payload.status || payload.payment_status || '').toLowerCase();
    const transactionId = payload.transaction_id || payload.payment_id || payload.id;
    const amount = payload.amount;
    const currency = payload.currency;

    console.log('Parsed webhook data:', {
      orderId,
      paymentStatus,
      transactionId,
      amount,
      currency
    });

    if (!orderId) {
      throw new Error('Order ID not found in webhook payload');
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      console.error('Order not found:', orderId, fetchError);
      throw new Error(`Order not found: ${orderId}`);
    }

    console.log('Current order status:', {
      id: currentOrder.id,
      payment_status: currentOrder.payment_status,
      booking_status: currentOrder.booking_status
    });

    // Update order status based on ContiPay payment status
    if (paymentStatus === 'success' || paymentStatus === 'completed' || paymentStatus === 'paid' || paymentStatus === 'successful') {
      console.log('Processing successful payment...');
      
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          booking_status: 'confirmed',
          payment_provider_id: transactionId,
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      // Update all tickets for this order to active status
      const { error: ticketsError } = await supabaseClient
        .from('tickets')
        .update({
          ticket_status: 'valid',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (ticketsError) {
        console.error('Error updating tickets:', ticketsError);
        // Don't throw - order update is more critical
      }

      // Get order details with tickets for confirmation email
      const { data: order } = await supabaseClient
        .from('orders')
        .select('*, tickets(*)')
        .eq('id', orderId)
        .single();

      if (order) {
        console.log('Payment confirmed for order:', orderId);
        console.log('Updated tickets count:', order.tickets?.length || 0);
        
        // Optionally send confirmation email
        try {
          await supabaseClient.functions.invoke('send-order-confirmation', {
            body: { orderNumber: order.order_number }
          });
          console.log('Confirmation email sent');
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't throw - payment is already confirmed
        }
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'declined' || paymentStatus === 'rejected') {
      console.log('Processing failed/cancelled payment...');
      
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'failed',
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      console.log('Order marked as failed/cancelled:', orderId);
    } else if (paymentStatus === 'pending' || paymentStatus === 'processing') {
      console.log('Payment still pending/processing:', orderId);
      
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'pending',
          payment_provider_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
      }
    } else {
      console.log('Unknown payment status:', paymentStatus);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing ContiPay webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
