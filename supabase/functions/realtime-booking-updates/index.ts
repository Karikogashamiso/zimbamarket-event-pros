import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Track connected users and their subscriptions
  const userSubscriptions = new Map();
  let userId: string | null = null;

  socket.onopen = () => {
    console.log("WebSocket connection opened");
    socket.send(JSON.stringify({
      type: "connection_established",
      message: "Connected to real-time booking updates"
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      switch (data.type) {
        case "authenticate":
          // Authenticate user and set up subscriptions
          userId = data.userId;
          if (userId) {
            await setupUserSubscriptions(userId);
          }
          break;

        case "subscribe_booking":
          // Subscribe to specific booking updates
          if (data.bookingId) {
            await subscribeToBooking(data.bookingId);
          }
          break;

        case "heartbeat":
          // Respond to heartbeat to keep connection alive
          socket.send(JSON.stringify({ type: "heartbeat_response" }));
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({
        type: "error",
        message: "Failed to process message"
      }));
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    // Clean up subscriptions
    userSubscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    userSubscriptions.clear();
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  // Set up user-specific subscriptions
  async function setupUserSubscriptions(userId: string) {
    try {
      // Subscribe to booking requests for this user
      const bookingChannel = supabase
        .channel(`user_bookings_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_requests',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Booking update:', payload);
            socket.send(JSON.stringify({
              type: "booking_update",
              event: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString()
            }));
          }
        )
        .subscribe();

      userSubscriptions.set(`bookings_${userId}`, bookingChannel);

      // Subscribe to business listing updates if user owns any
      const { data: businesses } = await supabase
        .from('business_listings')
        .select('id')
        .eq('user_id', userId);

      if (businesses && businesses.length > 0) {
        const businessIds = businesses.map(b => b.id);
        
        // Subscribe to booking requests for user's businesses
        const businessBookingsChannel = supabase
          .channel(`business_bookings_${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'booking_requests',
              filter: `service_id=in.(${businessIds.join(',')})`
            },
            (payload) => {
              console.log('Business booking update:', payload);
              socket.send(JSON.stringify({
                type: "business_booking_update",
                event: payload.eventType,
                data: payload.new || payload.old,
                timestamp: new Date().toISOString()
              }));
            }
          )
          .subscribe();

        userSubscriptions.set(`business_bookings_${userId}`, businessBookingsChannel);
      }

      socket.send(JSON.stringify({
        type: "subscriptions_active",
        message: "Real-time subscriptions are now active"
      }));

    } catch (error) {
      console.error("Error setting up subscriptions:", error);
      socket.send(JSON.stringify({
        type: "error",
        message: "Failed to set up real-time subscriptions"
      }));
    }
  }

  // Subscribe to specific booking updates
  async function subscribeToBooking(bookingId: string) {
    try {
      const bookingChannel = supabase
        .channel(`booking_${bookingId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_requests',
            filter: `id=eq.${bookingId}`
          },
          (payload) => {
            console.log('Specific booking update:', payload);
            socket.send(JSON.stringify({
              type: "specific_booking_update",
              bookingId: bookingId,
              event: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString()
            }));
          }
        )
        .subscribe();

      userSubscriptions.set(`booking_${bookingId}`, bookingChannel);

      socket.send(JSON.stringify({
        type: "booking_subscription_active",
        bookingId: bookingId,
        message: `Subscribed to updates for booking ${bookingId}`
      }));

    } catch (error) {
      console.error("Error subscribing to booking:", error);
      socket.send(JSON.stringify({
        type: "error",
        message: `Failed to subscribe to booking ${bookingId}`
      }));
    }
  }

  return response;
});
