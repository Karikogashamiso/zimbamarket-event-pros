import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  ticket_type_id: string;
  quantity: number;
  seat_id?: string;
}

interface CreateOrderRequest {
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  payment_method?: string;
}

serve(async (req: Request) => {
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

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const orderData: CreateOrderRequest = await req.json();
    console.log('Creating order with data:', { ...orderData, items: orderData.items.length });

    // Validate required fields
    if (!orderData.customer_first_name || !orderData.customer_last_name || 
        !orderData.customer_email || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customer_email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch ticket types and calculate total
    let totalAmount = 0;
    const ticketTypesData = [];

    for (const item of orderData.items) {
      const { data: ticketType, error: ticketError } = await supabaseClient
        .from('ticket_types')
        .select('id, name, base_price, currency, early_bird_price, early_bird_end_datetime, max_per_order, is_active')
        .eq('id', item.ticket_type_id)
        .single();

      if (ticketError || !ticketType) {
        console.error('Ticket type fetch error:', ticketError);
        return new Response(
          JSON.stringify({ error: `Invalid ticket type: ${item.ticket_type_id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!ticketType.is_active) {
        return new Response(
          JSON.stringify({ error: `Ticket type ${ticketType.name} is not available` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (item.quantity > ticketType.max_per_order) {
        return new Response(
          JSON.stringify({ error: `Maximum ${ticketType.max_per_order} tickets allowed per order for ${ticketType.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Determine price (early bird or regular)
      let price = ticketType.base_price;
      if (ticketType.early_bird_price && ticketType.early_bird_end_datetime) {
        const now = new Date();
        const earlyBirdEnd = new Date(ticketType.early_bird_end_datetime);
        if (now <= earlyBirdEnd) {
          price = ticketType.early_bird_price;
        }
      }

      ticketTypesData.push({
        ...ticketType,
        quantity: item.quantity,
        price_per_ticket: price,
        seat_id: item.seat_id,
      });

      totalAmount += price * item.quantity;
    }

    console.log('Order total calculated:', totalAmount);

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_first_name: orderData.customer_first_name,
        customer_last_name: orderData.customer_last_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        subtotal: totalAmount,
        total_amount: totalAmount,
        currency: ticketTypesData[0].currency,
        booking_status: 'pending',
        payment_status: 'pending',
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created:', order.id);

    // Create tickets
    const ticketsToCreate = [];
    for (const ticketTypeData of ticketTypesData) {
      for (let i = 0; i < ticketTypeData.quantity; i++) {
        const ticketNumber = `TKT-${order.id.substring(0, 8).toUpperCase()}-${Date.now()}-${i + 1}`;
        const qrCodeData = `${order.id}:${ticketTypeData.id}:${ticketNumber}`;
        
        ticketsToCreate.push({
          order_id: order.id,
          ticket_type_id: ticketTypeData.id,
          seat_id: ticketTypeData.seat_id || null,
          ticket_number: ticketNumber,
          qr_code_data: qrCodeData,
          original_price: ticketTypeData.base_price,
          paid_price: ticketTypeData.price_per_ticket,
          currency: ticketTypeData.currency,
          ticket_status: 'valid',
          holder_first_name: orderData.customer_first_name,
          holder_last_name: orderData.customer_last_name,
          holder_email: orderData.customer_email,
          holder_phone: orderData.customer_phone,
          original_holder_email: orderData.customer_email,
        });
      }
    }

    const { data: tickets, error: ticketsError } = await supabaseClient
      .from('tickets')
      .insert(ticketsToCreate)
      .select();

    if (ticketsError) {
      console.error('Tickets creation error:', ticketsError);
      // Rollback order if tickets fail
      await supabaseClient.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create tickets', details: ticketsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tickets created:', tickets.length);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          ...order,
          tickets: tickets,
          ticket_count: tickets.length,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in create-order function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
