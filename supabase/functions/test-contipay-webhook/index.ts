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
    const { orderId, status = 'success', amount, currency = 'USD' } = await req.json();
    
    console.log('Testing ContiPay webhook with:', { orderId, status, amount, currency });

    if (!orderId) {
      throw new Error('orderId is required');
    }

    // Construct mock ContiPay webhook payload
    const mockPayload = {
      reference: orderId,
      status: status,
      payment_status: status,
      transaction_id: `TEST_TXN_${Date.now()}`,
      payment_id: `TEST_PAY_${Date.now()}`,
      id: `TEST_ID_${Date.now()}`,
      amount: amount || 100,
      currency: currency,
      merchant_reference: orderId,
      order_id: orderId,
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
          usage: 'POST with { "orderId": "your-order-id", "status": "success|failed|pending|cancelled" }',
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
          usage: 'POST with { "orderId": "your-order-id", "status": "success|failed|pending|cancelled" }',
          example: {
            orderId: '51edc85d-4f4e-4892-ab6b-b4036b992da5',
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
