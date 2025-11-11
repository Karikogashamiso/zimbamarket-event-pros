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
      apiKeyLength: CONTIPAY_API_KEY?.length,
      apiKeyPrefix: CONTIPAY_API_KEY?.substring(0, 4) + '...',
      hasApiSecret: !!CONTIPAY_API_SECRET,
      secretLength: CONTIPAY_API_SECRET?.length,
      secretPrefix: CONTIPAY_API_SECRET?.substring(0, 4) + '...',
      hasMerchantId: !!CONTIPAY_MERCHANT_ID,
      merchantId: CONTIPAY_MERCHANT_ID,
      environment: CONTIPAY_ENVIRONMENT
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
      reference: paymentData.orderNumber,
      description: `Order ${paymentData.orderNumber}`,
      currencyCode: paymentData.currency,
      merchantId: parseInt(CONTIPAY_MERCHANT_ID),
      amount: paymentData.amount,
      webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`,
      successUrl: paymentData.returnUrl,
      cancelUrl: `${paymentData.returnUrl}?status=cancelled`,
      customer: {
        firstName: paymentData.customerInfo.firstName,
        surname: paymentData.customerInfo.lastName,
        email: paymentData.customerInfo.email,
        cell: phoneNumber,
      },
    };

    console.log('Creating ContiPay payment:', { 
      url: `${CONTIPAY_API_URL}/acquire/payment`,
      payload: paymentRequest 
    });

    // Try multiple authentication formats to identify the correct one
    const authFormats = [
      {
        name: 'X-API-KEY and X-SECRET-KEY headers',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': CONTIPAY_API_KEY,
          'X-SECRET-KEY': CONTIPAY_API_SECRET,
        }
      },
      {
        name: 'API-KEY and SECRET-KEY headers',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': CONTIPAY_API_KEY,
          'SECRET-KEY': CONTIPAY_API_SECRET,
        }
      },
      {
        name: 'Authorization: API_KEY:SECRET_KEY (no encoding)',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${CONTIPAY_API_KEY}:${CONTIPAY_API_SECRET}`,
        }
      },
      {
        name: 'Authorization: Bearer API_KEY',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONTIPAY_API_KEY}`,
        }
      },
      {
        name: 'Authorization: Basic Base64(API_KEY:SECRET_KEY)',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${CONTIPAY_API_KEY}:${CONTIPAY_API_SECRET}`)}`,
        }
      }
    ];

    let lastError = null;
    let response = null;

    // Try each authentication format
    for (const format of authFormats) {
      console.log(`Trying authentication: ${format.name}`);
      
      try {
        response = await fetch(`${CONTIPAY_API_URL}/acquire/payment`, {
          method: 'PUT',
          headers: format.headers,
          body: JSON.stringify(paymentRequest),
        });

        const responseText = await response.text();
        console.log(`Response for ${format.name}:`, {
          status: response.status,
          body: responseText,
        });

        // Try to parse the response
        let payment;
        try {
          payment = JSON.parse(responseText);
        } catch {
          console.log('Failed to parse response as JSON');
          continue;
        }

        // Check if this format worked (no error status)
        if (response.ok && payment.status !== 'Error' && !payment.error) {
          console.log(`✓ SUCCESS with format: ${format.name}`);
          
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
              authMethod: format.name,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        } else {
          lastError = payment.message || payment.error || 'Unknown error';
          console.log(`✗ Failed with: ${lastError}`);
        }
      } catch (error) {
        console.log(`✗ Exception with ${format.name}:`, error.message);
        lastError = error.message;
      }
    }

    // If we get here, all formats failed
    throw new Error(`All authentication formats failed. Last error: ${lastError}. Please contact ContiPay support to verify your UAT credentials and authentication method.`);
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
