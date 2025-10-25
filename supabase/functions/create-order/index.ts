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
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Use service role for database operations to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a client with auth for user identification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user (if any)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    console.log('Authenticated user:', user ? user.id : 'No user (guest checkout)');

    const orderData: CreateOrderRequest = await req.json();
    console.log('Creating order with data:', { 
      customer: `${orderData.customer_first_name} ${orderData.customer_last_name}`,
      email: orderData.customer_email,
      items: orderData.items.length,
      user_id: user?.id || 'null (guest)'
    });

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
    let eventId = null;
    let eventDetails = null;

    for (const item of orderData.items) {
      const { data: ticketType, error: ticketError } = await supabaseAdmin
        .from('ticket_types')
        .select(`
          id, name, base_price, currency, early_bird_price, early_bird_end_datetime, max_per_order, is_active, event_id, trip_id,
          events (
            id, title, event_date, venue:venues(name, address)
          )
        `)
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

      // Store event_id and event details
      if (ticketType.event_id) {
        eventId = ticketType.event_id;
        if (ticketType.events) {
          eventDetails = {
            id: ticketType.events.id,
            title: ticketType.events.title,
            date: ticketType.events.event_date,
            venue: ticketType.events.venue?.name,
            location: ticketType.events.venue?.address,
          };
        }
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

    // Check if user is trying to buy their own event tickets
    if (user && eventId) {
      const { data: eventOwnership } = await supabaseAdmin
        .rpc('user_owns_event', { 
          event_id_param: eventId, 
          user_id_param: user.id 
        });

      if (eventOwnership === true) {
        return new Response(
          JSON.stringify({ error: 'Event organizers cannot purchase tickets for their own events' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create order using admin client to bypass RLS
    // IMPORTANT: Link to user_id if authenticated, otherwise use email for guest tracking
    const orderInsertData = {
      user_id: user?.id || null,  // Link to authenticated user
      customer_first_name: orderData.customer_first_name,
      customer_last_name: orderData.customer_last_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      subtotal: totalAmount,
      total_amount: totalAmount,
      currency: ticketTypesData[0].currency,
      booking_status: 'pending' as 'pending',
      payment_status: 'pending' as 'pending',
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };

    console.log('Inserting order with user_id:', orderInsertData.user_id ? 'LINKED to user' : 'GUEST order');

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderInsertData)
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

    // Helper function to generate secure hash
    const generateSecureHash = async (data: string): Promise<string> => {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Helper function to generate digital signature
    const generateDigitalSignature = async (ticketData: any): Promise<string> => {
      const signatureInput = JSON.stringify(ticketData) + 'TICKET_SIGNING_SECRET';
      return await generateSecureHash(signatureInput);
    };

    // Create tickets with proper QR codes
    const ticketsToCreate = [];
    for (const ticketTypeData of ticketTypesData) {
      for (let i = 0; i < ticketTypeData.quantity; i++) {
        const ticketNumber = `TKT-${order.id.substring(0, 8).toUpperCase()}-${Date.now()}-${i + 1}`;
        
        // Create secure QR payload with event details
        const timestamp = Date.now();
        const expiryTimestamp = timestamp + (365 * 24 * 60 * 60 * 1000); // 1 year expiry
        
        const qrPayload = {
          ticketId: ticketNumber,
          orderId: order.id,
          eventId: eventDetails?.id || 'general',
          holderEmail: orderData.customer_email,
          tierName: ticketTypeData.name,
          price: ticketTypeData.price_per_ticket,
          currency: ticketTypeData.currency,
          // Include full event details
          eventTitle: eventDetails?.title || 'General Event',
          eventDate: eventDetails?.date,
          eventVenue: eventDetails?.venue,
          eventLocation: eventDetails?.location,
          timestamp: timestamp,
          expiry: expiryTimestamp,
          version: '2.1',
        };

        // Generate security hash
        const hashInput = Object.values(qrPayload).join(':');
        const securityHash = await generateSecureHash(hashInput);
        
        // Generate digital signature
        const signature = await generateDigitalSignature({ ...qrPayload, hash: securityHash });

        // Create validation URL for QR code (user-friendly when scanned)
        const validationData = btoa(JSON.stringify({
          ...qrPayload,
          hash: securityHash,
          signature: signature,
        }));
        
        // QR code contains a URL that displays ticket details nicely
        const qrCodeData = `https://pxpdjfkppgoaygdfmaqr.supabase.co/functions/v1/validate-ticket?data=${validationData}`;
        
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
          metadata: {
            tierName: ticketTypeData.name,
            position: i + 1,
            totalInTier: ticketTypeData.quantity,
            securityHash: securityHash,
            digitalSignature: signature,
            generatedAt: new Date().toISOString(),
            eventInfo: eventDetails,
          },
        });
      }
    }

    console.log('Attempting to create tickets:', ticketsToCreate.length);
    console.log('Sample ticket data:', JSON.stringify(ticketsToCreate[0], null, 2));

    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .insert(ticketsToCreate)
      .select();

    if (ticketsError) {
      console.error('Tickets creation error:', JSON.stringify(ticketsError, null, 2));
      console.error('Failed ticket data:', JSON.stringify(ticketsToCreate, null, 2));
      // Rollback order if tickets fail
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create tickets', 
          details: ticketsError.message,
          code: ticketsError.code,
          hint: ticketsError.hint
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tickets || tickets.length === 0) {
      console.error('No tickets were created despite no error');
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create tickets - no tickets returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully created ${tickets.length} tickets:`, tickets.map(t => t.ticket_number));

    // Send order confirmation email
    try {
      const formattedTickets = tickets.map((ticket: any) => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        ticket_type_name: ticketTypesData.find(tt => tt.id === ticket.ticket_type_id)?.name || 'General Admission',
        qr_code_data: ticket.qr_code_data
      }));

      const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          orderDetails: {
            ...order,
            tickets: formattedTickets
          }
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send order confirmation email:', await emailResponse.text());
      } else {
        console.log('Order confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

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
