import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderNumber, status = 'success', amount, currency = 'USD' } = await req.json();
    
    // Accept either orderId or orderNumber for backward compatibility
    const orderRef = orderNumber || orderId;
    
    console.log('Testing ContiPay webhook with:', { orderNumber: orderRef, status, amount, currency });

    if (!orderRef) {
      throw new Error('orderNumber is required');
    }

    // Construct mock ContiPay webhook payload
    const mockPayload = {
      reference: orderRef,
      status: status,
      payment_status: status,
      transaction_id: `TEST_TXN_${Date.now()}`,
      payment_id: `TEST_PAY_${Date.now()}`,
      id: `TEST_ID_${Date.now()}`,
      amount: amount || 100,
      currency: currency,
      merchant_reference: orderRef,
      order_id: orderRef,
      timestamp: new Date().toISOString(),
      // Mock additional fields that ContiPay might send
      payment_method: 'test_card',
      customer: {
        email: 'test@example.com',
        phone: '+263771234567'
      }
    };

    console.log('Mock webhook payload:', JSON.stringify(mockPayload, null, 2));

    // Get the webhook function URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const webhookUrl = `${supabaseUrl}/functions/v1/verify-contipay-payment`;
    
    console.log('Calling webhook at:', webhookUrl);

    // Call the actual webhook function
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify(mockPayload),
    });

    const webhookResult = await webhookResponse.json();
    
    console.log('Webhook response:', webhookResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test webhook sent successfully',
        payload: mockPayload,
        webhookResponse: webhookResult,
        instructions: {
          usage: 'POST with { "orderNumber": "ORD-xxx", "status": "success|failed|pending|cancelled" }',
          availableStatuses: ['success', 'completed', 'paid', 'successful', 'failed', 'cancelled', 'declined', 'rejected', 'pending', 'processing']
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error testing webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        instructions: {
          usage: 'POST with { "orderNumber": "ORD-xxx", "status": "success|failed|pending|cancelled" }',
          example: {
            orderNumber: 'ORD-1762845779087-I4F0PR6GK',
            status: 'success',
            amount: 1150,
            currency: 'USD'
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
