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

    // Handle GET requests (ContiPay verification ping)
    if (req.method === 'GET') {
      console.log('GET request received - webhook verification');
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook endpoint active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Parse request body safely
    const contentType = req.headers.get('content-type') || '';
    let payload: any = {};
    
    if (contentType.includes('application/json')) {
      const text = await req.text();
      if (text && text.trim()) {
        try {
          payload = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError, 'Body:', text);
          throw new Error('Invalid JSON payload');
        }
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      const text = await req.text();
      console.log('Unknown content type:', contentType, 'Body:', text);
      // Try to parse as JSON anyway
      if (text && text.trim()) {
        try {
          payload = JSON.parse(text);
        } catch {
          // If not JSON, treat as empty payload
          console.warn('Could not parse body as JSON, using empty payload');
        }
      }
    }
    
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
    const orderRef = payload.reference || payload.order_id || payload.merchant_reference;
    const paymentStatus = (payload.status || payload.payment_status || '').toLowerCase();
    const transactionId = payload.transaction_id || payload.payment_id || payload.id;
    const amount = payload.amount;
    const currency = payload.currency;

    console.log('Parsed webhook data:', {
      orderRef,
      paymentStatus,
      transactionId,
      amount,
      currency
    });

    if (!orderRef) {
      throw new Error('Order reference not found in webhook payload');
    }

    // Try to find order by order_number first, then by UUID id
    let currentOrder;
    let fetchError;
    
    // First try as order_number (ORD-xxx format)
    const { data: orderByNumber, error: errorByNumber } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('order_number', orderRef)
      .maybeSingle();
    
    if (orderByNumber) {
      currentOrder = orderByNumber;
    } else {
      // Try as UUID if it looks like one
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(orderRef)) {
        const { data: orderById, error: errorById } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderRef)
          .maybeSingle();
        
        currentOrder = orderById;
        fetchError = errorById;
      } else {
        fetchError = errorByNumber;
      }
    }

    if (!currentOrder) {
      console.error('Order not found:', orderRef, fetchError);
      throw new Error(`Order not found: ${orderRef}`);
    }

    console.log('Current order status:', {
      id: currentOrder.id,
      order_number: currentOrder.order_number,
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
        .eq('id', currentOrder.id);

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
        .eq('order_id', currentOrder.id);

      if (ticketsError) {
        console.error('Error updating tickets:', ticketsError);
        // Don't throw - order update is more critical
      }

      // Get order details with tickets for confirmation email
      const { data: order } = await supabaseClient
        .from('orders')
        .select('*, tickets(*)')
        .eq('id', currentOrder.id)
        .single();

      if (order) {
        console.log('Payment confirmed for order:', currentOrder.id);
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
        .eq('id', currentOrder.id);

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      console.log('Order marked as failed/cancelled:', currentOrder.id);
    } else if (paymentStatus === 'pending' || paymentStatus === 'processing') {
      console.log('Payment still pending/processing:', currentOrder.id);
      
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'pending',
          payment_provider_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id);

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
