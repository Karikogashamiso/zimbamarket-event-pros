import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  action: string;
  identifier: string; // IP address or email
  additionalData?: {
    email?: string;
    userAgent?: string;
  };
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
  requireAuth?: boolean;
}

// Rate limit configurations for different actions
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'contact_form': {
    maxAttempts: 5,
    windowMinutes: 15,
    blockMinutes: 30
  },
  'newsletter_signup': {
    maxAttempts: 3,
    windowMinutes: 10,
    blockMinutes: 60
  },
  'auth_register': {
    maxAttempts: 5,
    windowMinutes: 15,
    blockMinutes: 60
  },
  'auth_login': {
    maxAttempts: 10,
    windowMinutes: 15,
    blockMinutes: 30
  },
  'password_reset': {
    maxAttempts: 3,
    windowMinutes: 60,
    blockMinutes: 120
  },
  'booking_request': {
    maxAttempts: 10,
    windowMinutes: 10,
    blockMinutes: 15
  },
  'review_submission': {
    maxAttempts: 5,
    windowMinutes: 60,
    blockMinutes: 120
  },
  'business_application': {
    maxAttempts: 3,
    windowMinutes: 60,
    blockMinutes: 240
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { action, identifier, additionalData }: RateLimitRequest = await req.json();

    if (!action || !identifier) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action and identifier' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const config = RATE_LIMITS[action];
    if (!config) {
      console.log(`Unknown action: ${action}, allowing request`);
      return new Response(
        JSON.stringify({ allowed: true, message: 'Action not configured, request allowed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - (config.windowMinutes * 60 * 1000));
    const blockEnd = new Date(now.getTime() + (config.blockMinutes * 60 * 1000));

    console.log(`Rate limit check: ${action} for ${identifier}`);

    // Check current attempts in the window
    const { data: attempts, error: queryError } = await supabase
      .from('rate_limit_attempts')
      .select('*')
      .eq('action', action)
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Error querying rate limits:', queryError);
      // On error, allow the request but log the issue
      return new Response(
        JSON.stringify({ allowed: true, message: 'Rate limit check failed, allowing request' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const attemptCount = attempts?.length || 0;
    
    // Check if currently blocked
    const lastAttempt = attempts?.[0];
    if (lastAttempt && lastAttempt.is_blocked && new Date(lastAttempt.block_until) > now) {
      const minutesLeft = Math.ceil((new Date(lastAttempt.block_until).getTime() - now.getTime()) / (1000 * 60));
      
      console.log(`Blocked attempt: ${action} for ${identifier}, ${minutesLeft} minutes remaining`);
      
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          blocked: true,
          message: `Too many attempts. Please try again in ${minutesLeft} minutes.`,
          minutesUntilReset: minutesLeft,
          maxAttempts: config.maxAttempts,
          windowMinutes: config.windowMinutes
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if rate limit exceeded
    if (attemptCount >= config.maxAttempts) {
      console.log(`Rate limit exceeded: ${action} for ${identifier}, blocking for ${config.blockMinutes} minutes`);
      
      // Create blocked attempt record
      const { error: insertError } = await supabase
        .from('rate_limit_attempts')
        .insert({
          action,
          identifier,
          ip_address: additionalData?.userAgent ? identifier : null,
          email: additionalData?.email || null,
          user_agent: additionalData?.userAgent || null,
          is_blocked: true,
          block_until: blockEnd.toISOString(),
          metadata: {
            previousAttempts: attemptCount,
            blockReason: 'Rate limit exceeded'
          }
        });

      if (insertError) {
        console.error('Error inserting block record:', insertError);
      }

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          blocked: true,
          message: `Too many attempts (${attemptCount}/${config.maxAttempts}). Please try again in ${config.blockMinutes} minutes.`,
          minutesUntilReset: config.blockMinutes,
          maxAttempts: config.maxAttempts,
          windowMinutes: config.windowMinutes
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Record this attempt
    const { error: recordError } = await supabase
      .from('rate_limit_attempts')
      .insert({
        action,
        identifier,
        ip_address: additionalData?.userAgent ? identifier : null,
        email: additionalData?.email || null,
        user_agent: additionalData?.userAgent || null,
        is_blocked: false,
        metadata: {
          attemptNumber: attemptCount + 1,
          maxAttempts: config.maxAttempts
        }
      });

    if (recordError) {
      console.error('Error recording rate limit attempt:', recordError);
      // Still allow the request if we can't record it
    }

    const remainingAttempts = config.maxAttempts - (attemptCount + 1);
    console.log(`Rate limit check passed: ${action} for ${identifier}, ${remainingAttempts} attempts remaining`);

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        message: 'Request allowed',
        remainingAttempts,
        maxAttempts: config.maxAttempts,
        windowMinutes: config.windowMinutes,
        resetTime: new Date(now.getTime() + (config.windowMinutes * 60 * 1000)).toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Rate limiter error:', error);
    
    // On any error, allow the request but log the issue
    return new Response(
      JSON.stringify({ 
        allowed: true, 
        message: 'Rate limiter error, allowing request',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})