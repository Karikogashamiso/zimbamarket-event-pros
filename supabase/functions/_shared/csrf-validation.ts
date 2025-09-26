import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface CSRFValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateCSRFToken(
  request: Request,
  supabaseClient: any
): Promise<CSRFValidationResult> {
  // Skip validation for GET requests
  if (request.method === 'GET') {
    return { isValid: true };
  }

  const csrfToken = request.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return { 
      isValid: false, 
      error: 'CSRF token missing. Include x-csrf-token header.' 
    };
  }

  try {
    // Check if token exists and is not expired
    const { data: tokenRecord, error } = await supabaseClient
      .from('csrf_tokens')
      .select('*')
      .eq('token', csrfToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !tokenRecord) {
      return { 
        isValid: false, 
        error: 'Invalid or expired CSRF token' 
      };
    }

    // Optional: Remove the token after use (one-time use)
    // Uncomment the following lines if you want single-use tokens
    /*
    await supabaseClient
      .from('csrf_tokens')
      .delete()
      .eq('token', csrfToken);
    */

    return { isValid: true };

  } catch (error) {
    console.error('CSRF validation error:', error);
    return { 
      isValid: false, 
      error: 'CSRF validation failed' 
    };
  }
}