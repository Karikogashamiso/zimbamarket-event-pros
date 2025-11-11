import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContiPayPaymentRequest {
  orderId: string;
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
    const CONTIPAY_API_URL = Deno.env.get('CONTIPAY_API_URL') || 'https://api2-test.contipay.co.zw';
    const CONTIPAY_API_KEY = Deno.env.get('CONTIPAY_API_KEY');
    const CONTIPAY_MERCHANT_ID = Deno.env.get('CONTIPAY_MERCHANT_ID');

    console.log('Processing ContiPay payment for order:', paymentData.orderId);
    
    // Log environment configuration (without exposing full secrets)
    console.log('ContiPay Configuration Check:', {
      hasApiUrl: !!CONTIPAY_API_URL,
      hasApiKey: !!CONTIPAY_API_KEY,
      hasMerchantId: !!CONTIPAY_MERCHANT_ID,
      apiUrl: CONTIPAY_API_URL,
      apiKeyLength: CONTIPAY_API_KEY?.length || 0,
      merchantIdLength: CONTIPAY_MERCHANT_ID?.length || 0,
    });

    // Create payment request to ContiPay
    const contiPayRequest = {
      merchant_id: CONTIPAY_MERCHANT_ID,
      amount: paymentData.amount,
      currency: paymentData.currency,
      reference: paymentData.orderId,
      customer: {
        first_name: paymentData.customerInfo.firstName,
        last_name: paymentData.customerInfo.lastName,
        email: paymentData.customerInfo.email,
        phone: paymentData.customerInfo.phone,
      },
      return_url: paymentData.returnUrl,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`,
    };

    // Log request details (without full API key)
    const apiUrl = `${CONTIPAY_API_URL}/payments/initiate`;
    console.log('ContiPay Request Details:', {
      url: apiUrl,
      method: 'POST',
      hasAuthHeader: !!CONTIPAY_API_KEY,
      authHeaderPreview: CONTIPAY_API_KEY ? `Bearer ${CONTIPAY_API_KEY.substring(0, 10)}...` : 'MISSING',
      payload: contiPayRequest,
    });

    // Make request to ContiPay API
    // NOTE: This is a placeholder. Update with actual ContiPay API endpoint and structure
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTIPAY_API_KEY}`,
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
        paymentUrl: contiPayResponse.payment_url || contiPayResponse.checkout_url,
        paymentId: contiPayResponse.payment_id || contiPayResponse.transaction_id,
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
