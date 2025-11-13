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

    console.log('Webhook request method:', req.method);
    console.log('Webhook URL:', req.url);

    // Parse query parameters (ContiPay sends data here)
    const url = new URL(req.url);
    const payload = Object.fromEntries(url.searchParams.entries());
    
    console.log('ContiPay webhook payload:', JSON.stringify(payload, null, 2));

    // Extract data from payload
    const orderRef = payload.reference || payload.merchantReference;
    const paymentStatus = (payload.status || '').toLowerCase();
    const transactionId = payload.transID || payload.transactionId;
    
    console.log('Parsed data:', { orderRef, paymentStatus, transactionId });

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

    console.log('Current order:', {
      id: currentOrder.id,
      order_number: currentOrder.order_number,
      payment_status: currentOrder.payment_status,
    });

    // Update order based on status
    if (paymentStatus === 'completed' || paymentStatus === 'success' || paymentStatus === 'paid') {
      console.log('Processing successful payment...');
      
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

      console.log('Payment confirmed for order:', currentOrder.id);

      // Send confirmation email
      try {
        await supabaseClient.functions.invoke('send-order-confirmation', {
          body: { orderNumber: currentOrder.order_number }
        });
        console.log('Confirmation email sent');
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      console.log('Processing failed/cancelled payment...');
      
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'failed',
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id);

      console.log('Order marked as failed/cancelled:', currentOrder.id);
    } else if (paymentStatus === 'pending') {
      console.log('Payment still pending:', currentOrder.id);
      
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'pending',
          payment_provider_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id);
    }

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
