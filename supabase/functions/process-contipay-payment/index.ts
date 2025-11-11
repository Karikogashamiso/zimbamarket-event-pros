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
    const CONTIPAY_API_KEY = Deno.env.get('CONTIPAY_API_KEY');
    const CONTIPAY_API_SECRET = Deno.env.get('CONTIPAY_SECRET_KEY');
    const CONTIPAY_MERCHANT_ID = Deno.env.get('CONTIPAY_MERCHANT_ID');
    const CONTIPAY_ENVIRONMENT = Deno.env.get('CONTIPAY_ENVIRONMENT') || 'test';

    console.log('Processing ContiPay payment for order:', paymentData.orderNumber);
    console.log('Credentials status:', {
      hasApiKey: !!CONTIPAY_API_KEY,
      hasApiSecret: !!CONTIPAY_API_SECRET,
      hasMerchantId: !!CONTIPAY_MERCHANT_ID
    });

    if (!CONTIPAY_API_KEY || !CONTIPAY_API_SECRET) {
      throw new Error('ContiPay API credentials not configured');
    }

    if (!CONTIPAY_MERCHANT_ID) {
      throw new Error('ContiPay merchant ID not configured');
    }

    // Determine API URL based on environment
    const CONTIPAY_API_URL = CONTIPAY_ENVIRONMENT === 'live' 
      ? 'https://api-v2.contipay.co.zw' 
      : 'https://api-uat.contipay.net';

    // Convert phone to integer (remove any non-digits)
    const phoneNumber = parseInt(paymentData.customerInfo.phone.replace(/\D/g, ''));

    // Create payment request matching ContiPay API spec
    const paymentRequest = {
      amount: paymentData.amount,
      phone: phoneNumber.toString(),
      currency: paymentData.currency,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`,
      return_url: paymentData.returnUrl,
      reference: paymentData.orderNumber,
      description: `Order ${paymentData.orderNumber}`,
    };

    console.log('Creating ContiPay payment:', { 
      url: `${CONTIPAY_API_URL}/payment/initiate`,
      payload: paymentRequest 
    });

    // Create Basic Auth header using standard btoa encoding
    const credentials = btoa(`${CONTIPAY_API_KEY}:${CONTIPAY_API_SECRET}`);

    // Make request to ContiPay API
    const response = await fetch(`${CONTIPAY_API_URL}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
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

    // Extract redirect URL
    const redirectUrl = payment.redirect_url;
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
