import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sanitizeEmail, validateSecureInput } from '../_shared/input-sanitization.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NewsletterSignupData {
  email: string;
  source?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const rawData = await req.json() as NewsletterSignupData;
    
    console.log('Newsletter signup request received:', { email: rawData.email, source: rawData.source });

    // Validate required fields
    if (!rawData.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(rawData.email);
    console.log('Email sanitized:', sanitizedEmail);
    
    if (!sanitizedEmail) {
      console.error('Email sanitization failed for:', rawData.email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Additional security validation
    const validation = validateSecureInput(sanitizedEmail);
    console.log('Security validation result:', validation);
    
    if (!validation.isValid) {
      console.warn('Potentially malicious email input detected:', validation.reason);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email detected',
          message: 'The provided email contains invalid characters.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize source if provided
    const sanitizedSource = rawData.source ? 
      rawData.source.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 50) : 
      'unknown';
    
    console.log('Proceeding with sanitized data:', { email: sanitizedEmail, source: sanitizedSource });

    // Check if email already exists
    console.log('Checking for existing subscription...');
    const { data: existingSubscription, error: checkError } = await supabaseClient
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('email', sanitizedEmail)
      .single();

    console.log('Check result:', { existingSubscription, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', checkError);
      return new Response(
        JSON.stringify({ 
          error: 'Database error',
          message: 'Unable to check existing subscriptions',
          details: checkError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingSubscription) {
      console.log('Found existing subscription:', existingSubscription);
      if (existingSubscription.is_active) {
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'This email is already subscribed to our newsletter.',
            alreadySubscribed: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabaseClient
          .from('newsletter_subscriptions')
          .update({ 
            is_active: true,
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id);

        if (updateError) {
          console.error('Failed to reactivate subscription:', updateError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to process subscription',
              message: 'Unable to process your subscription. Please try again.'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Successfully reactivated your newsletter subscription!'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new subscription
    console.log('Creating new subscription...');
    const { data, error } = await supabaseClient
      .from('newsletter_subscriptions')
      .insert({
        email: sanitizedEmail,
        source: sanitizedSource,
        is_active: true,
        metadata: {
          signup_ip: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          signup_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    console.log('Insert result:', { data, error });

    if (error) {
      console.error('Database insertion error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'Failed to subscribe',
          message: error.message || 'Unable to process your subscription. Please try again.',
          details: error.hint || error.details
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful subscription (without sensitive data)
    console.log('Newsletter subscription successful:', {
      id: data.id,
      email: sanitizedEmail,
      source: sanitizedSource,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed to our newsletter!',
        subscriptionId: data.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Newsletter signup processing error:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unable to process your subscription. Please try again later.',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});