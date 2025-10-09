import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error("User not authenticated");

    const { bookingRequestId } = await req.json();
    
    console.log('Confirming payment for booking:', bookingRequestId);

    // Verify booking belongs to user
    const { data: booking, error: fetchError } = await supabaseClient
      .from('booking_requests')
      .select('user_id, payment_status')
      .eq('id', bookingRequestId)
      .single();

    if (fetchError || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    // Update payment status to paid (not 'completed')
    const { error: updateError } = await supabaseClient
      .from('booking_requests')
      .update({ payment_status: 'paid' })
      .eq('id', bookingRequestId);

    if (updateError) throw updateError;

    console.log('Payment confirmed successfully for booking:', bookingRequestId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
