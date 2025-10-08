import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { orderNumber } = await req.json();
    console.log('Verifying payment for order:', orderNumber);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // If already confirmed, return success
    if (order.payment_status === 'paid' || order.payment_status === 'completed') {
      console.log('Order already confirmed');
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadyConfirmed: true,
          order 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for Stripe sessions with this order metadata
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    const matchingSession = sessions.data.find(
      session => session.metadata?.orderNumber === orderNumber
    );

    if (!matchingSession) {
      throw new Error('Payment session not found');
    }

    console.log('Found session:', matchingSession.id, 'Status:', matchingSession.payment_status);

    // Check if payment was successful
    if (matchingSession.payment_status === 'paid') {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          booking_status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        throw new Error('Failed to update order status');
      }

      // Create payment transaction record
      await supabase.from('payment_transactions').insert({
        order_id: order.id,
        amount: order.total_amount,
        currency: order.currency,
        status: 'paid',
        transaction_type: 'payment',
        payment_method: 'card',
        payment_provider: 'stripe',
        provider_transaction_id: matchingSession.id,
        provider_response: {
          session_id: matchingSession.id,
          payment_intent: matchingSession.payment_intent
        }
      });

      console.log('Order updated successfully');

      return new Response(
        JSON.stringify({ 
          success: true,
          paymentConfirmed: true,
          order: {
            ...order,
            payment_status: 'paid',
            booking_status: 'confirmed'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          paymentStatus: matchingSession.payment_status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
