import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Determine API URL based on environment
    const CONTIPAY_API_URL = CONTIPAY_ENVIRONMENT === 'live' 
      ? 'https://api.contipay.co.zw' 
      : 'https://api2-test.contipay.co.zw';

    // Create payment request following ContiPay SDK structure
    const paymentRequest = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      reference: paymentData.orderNumber,
      description: `Order ${paymentData.orderNumber}`,
      returnUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`,
      successUrl: paymentData.returnUrl,
      cancelUrl: `${paymentData.returnUrl}?status=cancelled`,
    };

    console.log('Creating ContiPay redirect payment:', { 
      url: `${CONTIPAY_API_URL}/payments/redirect`,
      payload: paymentRequest 
    });

    // Make request to ContiPay API with authentication headers
    const response = await fetch(`${CONTIPAY_API_URL}/payments/redirect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTIPAY_AUTH_KEY}`,
        'X-Auth-Key': CONTIPAY_AUTH_KEY,
        'X-Auth-Secret': CONTIPAY_AUTH_SECRET,
      },
      body: JSON.stringify(paymentRequest),
    });

    const responseText = await response.text();
    console.log('ContiPay Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      throw new Error(`ContiPay API error: ${response.status} - ${responseText}`);
    }

    // Parse response
    let payment;
    try {
      payment = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse ContiPay response:', parseError);
      throw new Error(`Invalid JSON response from ContiPay: ${responseText}`);
    }

    // Check for error response
    if (payment.status === 'Error' || payment.error) {
      const errorMessage = payment.message || payment.error || 'Unknown ContiPay error';
      console.error('ContiPay returned error:', payment);
      throw new Error(`ContiPay API error: ${errorMessage}`);
    }

    // Extract redirect URL
    const redirectUrl = payment.redirectUrl || payment.redirect_url || payment.paymentUrl || payment.payment_url;
    if (!redirectUrl) {
      console.error('ContiPay response missing redirect URL:', payment);
      throw new Error('ContiPay did not return a payment redirect URL');
    }

    // Update order with ContiPay payment details
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        payment_method: 'contipay',
        payment_provider_id: payment.paymentId || payment.payment_id || payment.transactionId || payment.transaction_id,
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
        paymentUrl: redirectUrl,
        paymentId: payment.paymentId || payment.payment_id || payment.transactionId || payment.transaction_id,
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
