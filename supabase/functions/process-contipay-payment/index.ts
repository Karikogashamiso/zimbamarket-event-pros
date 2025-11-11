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
    const CONTIPAY_API_URL = CONTIPAY_ENVIRONMENT === 'live' 
      ? 'https://api.contipay.co.zw' 
      : 'https://api2-test.contipay.co.zw';

    console.log('Processing ContiPay payment for order:', paymentData.orderNumber);

    // Create payment redirect request following ContiPay SDK pattern
    // Note: customerInfo is NOT included in redirect payments per SDK docs
    const contiPayRequest = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      reference: paymentData.orderNumber,
      description: `Order ${paymentData.orderNumber}`,
      returnUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`,
      successUrl: paymentData.returnUrl,
      cancelUrl: `${paymentData.returnUrl}?status=cancelled`,
    };

    // Make request to ContiPay API
    const apiUrl = `${CONTIPAY_API_URL}/payments/redirect`;
    console.log('ContiPay Request:', { url: apiUrl, payload: contiPayRequest });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Key': CONTIPAY_AUTH_KEY || '',
        'X-Auth-Secret': CONTIPAY_AUTH_SECRET || '',
      },
      body: JSON.stringify(contiPayRequest),
    });

    // Log response status and headers
    console.log('ContiPay Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Get response text first (so we can log it even if parsing fails)
    const responseText = await response.text();
    console.log('ContiPay Response Body (raw):', responseText);

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        url: apiUrl,
        requestPayload: contiPayRequest,
      };
      console.error('ContiPay API Error - Full Details:', JSON.stringify(errorDetails, null, 2));
      throw new Error(`ContiPay API error: ${response.status} - ${responseText}`);
    }

    // Parse JSON response
    let contiPayResponse;
    try {
      contiPayResponse = responseText ? JSON.parse(responseText) : {};
      console.log('ContiPay Parsed Response:', JSON.stringify(contiPayResponse, null, 2));
    } catch (parseError) {
      console.error('Failed to parse ContiPay response as JSON:', parseError);
      throw new Error(`Invalid JSON response from ContiPay: ${responseText}`);
    }

    // Check for ContiPay error response (they return 200 OK even for errors)
    if (contiPayResponse.status === 'Error' || contiPayResponse.statusCode) {
      const errorMessage = contiPayResponse.message || 'Unknown ContiPay error';
      console.error('ContiPay API returned error:', {
        status: contiPayResponse.status,
        statusCode: contiPayResponse.statusCode,
        message: errorMessage,
        mode: contiPayResponse.mode,
      });
      throw new Error(`ContiPay API error: ${errorMessage}`);
    }

    // Verify we got a redirect URL
    const redirectUrl = contiPayResponse.redirectUrl || contiPayResponse.payment_url || contiPayResponse.checkout_url;
    if (!redirectUrl) {
      console.error('ContiPay response missing redirect URL:', contiPayResponse);
      throw new Error('ContiPay did not return a payment redirect URL. Response: ' + JSON.stringify(contiPayResponse));
    }

    // Update order with ContiPay payment details
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        payment_method: 'contipay',
        payment_provider_id: contiPayResponse.payment_id || contiPayResponse.transaction_id,
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
        paymentUrl: contiPayResponse.redirectUrl || contiPayResponse.payment_url || contiPayResponse.checkout_url,
        paymentId: contiPayResponse.paymentId || contiPayResponse.payment_id || contiPayResponse.transaction_id,
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
