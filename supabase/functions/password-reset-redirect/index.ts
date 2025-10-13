import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const redirectTo = url.searchParams.get("redirect_to") || "http://localhost:3000/auth";
    
    if (!token) {
      return new Response("Missing token parameter", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Construct the Supabase verification URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;
    
    console.log("Redirecting to:", verificationUrl);
    
    // Redirect to the Supabase verification endpoint
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": verificationUrl,
      },
    });
  } catch (error) {
    console.error("Error in password-reset-redirect:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
