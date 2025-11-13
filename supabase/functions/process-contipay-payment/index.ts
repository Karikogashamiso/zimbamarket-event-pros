import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { isValidEmail, formatPhoneNumber, getAlpha2CountryCode } from "../_shared/contipay-utils.ts";
import { fetchWithRetry } from "../_shared/fetch-utils.ts";

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
    // Input validation
    const paymentData: ContiPayPaymentRequest = await req.json();

    // Rate limiting (using order ID as identifier)
    if (!checkRateLimit(paymentData.orderId)) {
      console.warn('Rate limit exceeded for order:', paymentData.orderId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    // Validate required fields
    if (!paymentData.orderId || !paymentData.orderNumber) {
      throw new Error('Order ID and order number are required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Invalid amount. Amount must be greater than 0');
    }

    if (!paymentData.currency || paymentData.currency.length !== 3) {
      throw new Error('Invalid currency code. Must be a 3-letter ISO code');
    }

    if (!isValidEmail(paymentData.customerInfo.email)) {
      throw new Error('Invalid email address');
    }

    if (!paymentData.returnUrl || !paymentData.returnUrl.startsWith('http')) {
      throw new Error('Invalid return URL');
    }

    // Load and validate environment variables
    const CONTIPAY_API_KEY = Deno.env.get('CONTIPAY_API_KEY');
    const CONTIPAY_API_SECRET = Deno.env.get('CONTIPAY_SECRET_KEY');
    const CONTIPAY_MERCHANT_ID = Deno.env.get('CONTIPAY_MERCHANT_ID');
    const CONTIPAY_ENVIRONMENT = Deno.env.get('CONTIPAY_ENVIRONMENT') || 'test';

    console.log('Environment configuration:', {
      environment: CONTIPAY_ENVIRONMENT,
      hasApiKey: !!CONTIPAY_API_KEY,
      hasApiSecret: !!CONTIPAY_API_SECRET,
      hasMerchantId: !!CONTIPAY_MERCHANT_ID,
      apiKeyLength: CONTIPAY_API_KEY?.length || 0,
      apiSecretLength: CONTIPAY_API_SECRET?.length || 0,
    });

    if (!CONTIPAY_API_KEY || CONTIPAY_API_KEY.trim() === '') {
      throw new Error('CONTIPAY_API_KEY is not configured or is empty');
    }

    if (!CONTIPAY_API_SECRET || CONTIPAY_API_SECRET.trim() === '') {
      throw new Error('CONTIPAY_SECRET_KEY is not configured or is empty');
    }

    if (!CONTIPAY_MERCHANT_ID || CONTIPAY_MERCHANT_ID.trim() === '') {
      throw new Error('CONTIPAY_MERCHANT_ID is not configured or is empty');
    }

    // Validate merchant ID is a valid number
    const merchantIdNum = parseInt(CONTIPAY_MERCHANT_ID);
    if (isNaN(merchantIdNum)) {
      throw new Error('CONTIPAY_MERCHANT_ID must be a valid number');
    }

    console.log('Processing ContiPay payment for order:', paymentData.orderNumber);

    // Determine API URL based on environment
    const CONTIPAY_API_URL = CONTIPAY_ENVIRONMENT === 'live' 
      ? 'https://api-v2.contipay.co.zw' 
      : 'https://api-uat.contipay.net';

    console.log('Using ContiPay API:', CONTIPAY_API_URL);

    // Format phone number with validation
    const formattedPhone = formatPhoneNumber(
      paymentData.customerInfo.phone,
      paymentData.customerInfo.country || 'ZW'
    );

    console.log('Phone number formatted:', {
      original: paymentData.customerInfo.phone,
      formatted: formattedPhone,
    });

    // Verify webhook URL
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-contipay-payment`;
    console.log('Webhook URL:', webhookUrl);
    
    // Create payment request matching ContiPay API spec
    const customerCountry = paymentData.customerInfo.country || 'ZW';
    const alpha2CountryCode = getAlpha2CountryCode(customerCountry);
    
    console.log('Country code mapping:', {
      original: customerCountry,
      mapped: alpha2CountryCode,
    });
    
    const paymentRequest = {
      webhookUrl,
      description: `Order ${paymentData.orderNumber}`,
      amount: paymentData.amount,
      reference: paymentData.orderNumber,
      merchantId: merchantIdNum,
      currencyCode: paymentData.currency.toUpperCase(),
      successUrl: paymentData.returnUrl,
      cancelUrl: `${paymentData.returnUrl}?status=cancelled`,
      customer: {
        nationalId: "",
        surname: paymentData.customerInfo.lastName,
        firstName: paymentData.customerInfo.firstName,
        middleName: "",
        email: paymentData.customerInfo.email,
        cell: formattedPhone,
        countryCode: alpha2CountryCode,
      },
    };

    console.log('Payment request prepared:', { 
      url: `${CONTIPAY_API_URL}/acquire/payment`,
      amount: paymentRequest.amount,
      currency: paymentRequest.currencyCode,
      reference: paymentRequest.reference,
    });

    // Create Basic Authorization header
    const authString = `${CONTIPAY_API_KEY}:${CONTIPAY_API_SECRET}`;
    const base64Auth = btoa(authString);
    const authHeader = `Basic ${base64Auth}`;

    console.log('Authentication configured:', {
      method: 'Basic Auth',
      encodedLength: base64Auth.length,
    });

    // Make request to ContiPay API with retry logic and timeout
    const response = await fetchWithRetry(
      `${CONTIPAY_API_URL}/acquire/payment`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(paymentRequest),
      },
      3, // retries
      30000 // 30 second timeout
    );

    const responseText = await response.text();
    console.log('ContiPay Response:', {
      status: response.status,
      statusText: response.statusText,
      bodyLength: responseText.length,
    });

    if (!response.ok) {
      console.error('ContiPay API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      throw new Error(`ContiPay API error: ${response.status} - ${responseText}`);
    }

    // Parse response
    let payment;
    try {
      payment = JSON.parse(responseText);
      console.log('Parsed payment response:', {
        hasPaymentId: !!(payment.paymentId || payment.payment_id),
        hasRedirectUrl: !!(payment.redirectUrl || payment.redirect_url || payment.paymentUrl || payment.payment_url),
        status: payment.status,
      });
    } catch (parseError) {
      console.error('Failed to parse ContiPay response:', {
        error: parseError.message,
        responseText: responseText.substring(0, 500),
      });
      throw new Error(`Invalid JSON response from ContiPay: ${responseText.substring(0, 200)}`);
    }

    // Check for error response
    if (payment.status === 'Error' || payment.error) {
      const errorMessage = payment.message || payment.error || 'Unknown ContiPay error';
      const statusCode = payment.statusCode || 'unknown';
      
      console.error('ContiPay API rejected request:', {
        status: payment.status,
        statusCode: statusCode,
        message: errorMessage,
        fullResponse: payment,
      });
      
      // Provide more specific error messages based on error type
      let userMessage = errorMessage;
      if (errorMessage.toLowerCase().includes('authorization') || 
          errorMessage.toLowerCase().includes('token incorrect')) {
        userMessage = 'Payment gateway configuration error. Please contact support.';
      } else if (errorMessage.toLowerCase().includes('merchant')) {
        userMessage = 'Merchant account issue. Please contact support.';
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        userMessage = 'Invalid payment request. Please check your details and try again.';
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: userMessage,
          details: {
            statusCode: statusCode,
            reference: paymentData.orderNumber,
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Extract redirect URL with multiple fallback field names
    const redirectUrl = 
      payment.redirectUrl || 
      payment.redirect_url || 
      payment.paymentUrl || 
      payment.payment_url ||
      payment.checkoutUrl ||
      payment.checkout_url;

    if (!redirectUrl) {
      console.error('ContiPay response missing redirect URL:', payment);
      throw new Error('ContiPay did not return a payment redirect URL. Please contact support.');
    }

    // Extract payment ID with multiple fallback field names
    const paymentId = 
      payment.paymentId || 
      payment.payment_id || 
      payment.transactionId || 
      payment.transaction_id ||
      payment.id;

    if (!paymentId) {
      console.warn('ContiPay response missing payment ID:', payment);
    }

    // Update order with ContiPay payment details
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        payment_method: 'contipay',
        payment_provider_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentData.orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      // Don't throw - payment was created successfully
      // Log error but continue to return success
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: redirectUrl,
        paymentId: paymentId,
        reference: paymentData.orderNumber,
        message: 'ContiPay payment initiated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing ContiPay payment:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Provide user-friendly error messages
    let userMessage = 'Payment processing failed. Please try again later.';
    let statusCode = 400;
    
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      userMessage = 'Payment gateway timeout. Please check your connection and try again.';
      statusCode = 504;
    } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      userMessage = 'Cannot connect to payment gateway. Please try again later.';
      statusCode = 503;
    } else if (error.message?.includes('configuration') || error.message?.includes('not configured')) {
      userMessage = 'Payment service configuration error. Please contact support.';
      statusCode = 500;
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: userMessage,
        technical_details: error.message, // For debugging, not shown to user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
