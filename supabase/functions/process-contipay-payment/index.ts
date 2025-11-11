import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ContiPay } from "npm:@contipay/sdk@latest";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContiPayPaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
  };
  returnUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const paymentData: ContiPayPaymentRequest = await req.json();

    // ContiPay API configuration
    const CONTIPAY_AUTH_KEY = Deno.env.get('CONTIPAY_API_KEY');
    const CONTIPAY_AUTH_SECRET = Deno.env.get('CONTIPAY_SECRET_KEY');
    const CONTIPAY_ENVIRONMENT = Deno.env.get('CONTIPAY_ENVIRONMENT') || 'test';

    console.log('Processing ContiPay payment for order:', paymentData.orderNumber);

    if (!CONTIPAY_AUTH_KEY || !CONTIPAY_AUTH_SECRET) {
      throw new Error('ContiPay credentials not configured');
    }

    // Initialize ContiPay SDK
    const contiPay = new ContiPay({
      authKey: CONTIPAY_AUTH_KEY,
      authSecret: CONTIPAY_AUTH_SECRET,
      environment: CONTIPAY_ENVIRONMENT as 'test' | 'live',
    });

    console.log('Creating redirect payment with ContiPay SDK...');

    // Create redirect payment using official SDK
    const payment = await contiPay.payments.createRedirect({
      amount: paymentData.amount,
      currency: paymentData.currency,
      reference: paymentData.orderNumber,
      description: `Order ${paymentData.orderNumber}`,
      returnUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`,
      successUrl: paymentData.returnUrl,
      cancelUrl: `${paymentData.returnUrl}?status=cancelled`,
    });

    console.log('ContiPay SDK Response:', payment);

    if (!payment || !payment.redirectUrl) {
      console.error('ContiPay response missing redirect URL:', payment);
      throw new Error('ContiPay did not return a payment redirect URL');
    }

    // Update order with ContiPay payment details
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        payment_method: 'contipay',
        payment_provider_id: payment.paymentId || payment.transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentData.orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: payment.redirectUrl,
        paymentId: payment.paymentId || payment.transactionId,
        reference: paymentData.orderNumber,
        message: 'ContiPay payment initiated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing ContiPay payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
