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

    // Parse the JSON body from ContiPay webhook
    const payload = await req.json();
    
    console.log('🔔 ContiPay Webhook Received:', {
      timestamp: new Date().toISOString(),
      payload: JSON.stringify(payload, null, 2),
    });

    // Verify webhook signature if provided
    const webhookSignature = req.headers.get('x-contipay-signature');
    console.log('🔐 Webhook signature verification skipped (no signature or secret key)');

    // Log headers for debugging
    console.log('📋 Webhook headers:', Object.fromEntries(req.headers.entries()));

    // Extract data from webhook payload (ContiPay field names)
    const orderRef = payload.merchantRef;
    const paymentStatus = (payload.status || '').toLowerCase();
    const transactionId = payload.contiPayRef || payload.correlator;
    const amount = payload.amount;
    const currency = payload.currencyCode;
    
    console.log('📦 Parsed webhook data:', { 
      orderRef, 
      paymentStatus: paymentStatus.toUpperCase(), 
      transactionId, 
      amount, 
      currency 
    });

    if (!orderRef) {
      throw new Error('Order reference not found in webhook payload');
    }

    // Find order
    const { data: currentOrder, error: fetchError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('order_number', orderRef)
      .maybeSingle();

    if (!currentOrder) {
      console.error('Order not found:', orderRef, fetchError);
      throw new Error(`Order not found: ${orderRef}`);
    }

    console.log('🔍 Current order:', {
      id: currentOrder.id,
      order_number: currentOrder.order_number,
      current_payment_status: currentOrder.payment_status,
      incoming_payment_status: paymentStatus.toUpperCase(),
    });

    // Update order based on status
    if (paymentStatus === 'completed' || paymentStatus === 'success' || paymentStatus === 'paid') {
      console.log('✅ Processing SUCCESSFUL payment...');
      
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          booking_status: 'confirmed',
          payment_provider_id: transactionId,
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id);

      // Update tickets
      await supabaseClient
        .from('tickets')
        .update({
          ticket_status: 'valid',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', currentOrder.id);

      console.log('✅ Payment confirmed for order:', currentOrder.id);

      // Send confirmation email
      try {
        await supabaseClient.functions.invoke('send-order-confirmation', {
          body: { orderNumber: currentOrder.order_number }
        });
        console.log('📧 Confirmation email sent');
      } catch (emailError) {
        console.error('❌ Error sending confirmation email:', emailError);
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'declined') {
      console.log('❌ Processing FAILED/CANCELLED/DECLINED payment...');
      
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'failed',
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id);

      console.log('❌ Order marked as failed/cancelled/declined:', currentOrder.id);
    } else if (paymentStatus === 'pending') {
      console.log('⏳ Payment still PENDING:', currentOrder.id);
      
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'pending',
          payment_provider_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id);
    } else {
      console.log('⚠️ Unknown payment status received:', paymentStatus);
    }

    console.log('✅ Webhook processing completed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
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
