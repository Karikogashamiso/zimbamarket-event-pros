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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const paymentData: ContiPayPaymentRequest = await req.json();

    // ContiPay API configuration
    const CONTIPAY_API_URL = Deno.env.get('CONTIPAY_API_URL') || 'https://api2-test.contipay.co.zw';
    const CONTIPAY_API_KEY = Deno.env.get('CONTIPAY_API_KEY');
    const CONTIPAY_MERCHANT_ID = Deno.env.get('CONTIPAY_MERCHANT_ID');

    console.log('Processing ContiPay payment for order:', paymentData.orderId);

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

    // Make request to ContiPay API
    // NOTE: This is a placeholder. Update with actual ContiPay API endpoint and structure
    const response = await fetch(`${CONTIPAY_API_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTIPAY_API_KEY}`,
      },
      body: JSON.stringify(contiPayRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ContiPay API error:', errorText);
      throw new Error(`ContiPay API error: ${response.status}`);
    }

    const contiPayResponse = await response.json();

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
