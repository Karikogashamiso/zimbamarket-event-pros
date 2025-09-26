import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateCSRFToken } from '../_shared/csrf-validation.ts'
import { sanitizeFormData, validateSecureInput } from '../_shared/input-sanitization.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
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

    // Validate CSRF token
    const csrfValidation = await validateCSRFToken(req, supabaseClient);
    if (!csrfValidation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: 'CSRF validation failed',
          message: csrfValidation.error 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const rawData = await req.json() as ContactFormData;

    // Validate required fields
    if (!rawData.firstName || !rawData.lastName || !rawData.email || !rawData.subject || !rawData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all input data
    const sanitizedData = sanitizeFormData(rawData);

    // Additional security validation for sensitive fields
    const sensitiveFields = [sanitizedData.message, sanitizedData.subject];
    for (const field of sensitiveFields) {
      const validation = validateSecureInput(field);
      if (!validation.isValid) {
        console.warn('Potentially malicious input detected:', validation.reason);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input detected',
            message: 'Your submission contains content that cannot be processed. Please review and try again.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate email format after sanitization
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert sanitized data into database
    const { data, error } = await supabaseClient
      .from('contact_submissions')
      .insert({
        first_name: sanitizedData.firstName,
        last_name: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone || null,
        subject: sanitizedData.subject,
        message: sanitizedData.message
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit form',
          message: 'Unable to process your submission. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful submission (without sensitive data)
    console.log('Contact form submitted successfully:', {
      id: data.id,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.',
        submissionId: data.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Contact form processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Unable to process your request. Please try again later.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});