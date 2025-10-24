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
    console.log('ContiPay webhook received:', payload);

    // ContiPay API configuration
    const CONTIPAY_SECRET_KEY = Deno.env.get('CONTIPAY_SECRET_KEY') || 'your_secret_key_here';

    // Verify webhook signature (placeholder - implement based on ContiPay docs)
    // const signature = req.headers.get('X-ContiPay-Signature');
    // if (!verifySignature(payload, signature, CONTIPAY_SECRET_KEY)) {
    //   throw new Error('Invalid webhook signature');
    // }

    const orderId = payload.reference || payload.order_id;
    const paymentStatus = payload.status;
    const transactionId = payload.transaction_id || payload.payment_id;

    // Update order status based on ContiPay payment status
    if (paymentStatus === 'success' || paymentStatus === 'completed' || paymentStatus === 'paid') {
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'confirmed',
          payment_provider_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      // Get order details to send confirmation
      const { data: order } = await supabaseClient
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (order) {
        // Send confirmation email (optional)
        console.log('Payment confirmed for order:', orderId);
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }
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
