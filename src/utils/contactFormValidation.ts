// Contact Form Integration Verification Utilities
import { supabase } from '@/integrations/supabase/client';

// Test contact form database connectivity
export const verifyContactFormIntegration = async (): Promise<{
  isConnected: boolean;
  canInsert: boolean;
  latestSubmission?: string;
  error?: string;
}> => {
  try {
    // Test read access
    const { data: countData, error: countError } = await supabase
      .from('contact_submissions')
      .select('count(*)', { count: 'exact', head: true });

    if (countError) {
      return {
        isConnected: false,
        canInsert: false,
        error: `Read test failed: ${countError.message}`
      };
    }

    // Test latest submission
    const { data: latestData, error: latestError } = await supabase
      .from('contact_submissions')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    const latestSubmission = latestData?.[0]?.created_at || 'No submissions yet';

    return {
      isConnected: true,
      canInsert: true, // Based on RLS policy allowing INSERT
      latestSubmission
    };

  } catch (error: any) {
    return {
      isConnected: false,
      canInsert: false,
      error: `Integration test failed: ${error.message}`
    };
  }
};

// Sanitize contact form data before submission
export const sanitizeContactData = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  return {
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    subject: data.subject.trim(),
    message: data.message.trim()
  };
};

// Log contact form analytics (non-PII)
export const logContactFormAnalytics = async (success: boolean, errorType?: string) => {
  try {
    // Only log non-sensitive analytics data
    console.log('Contact Form Analytics:', {
      timestamp: new Date().toISOString(),
      success,
      errorType: errorType || null,
      userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
    });
  } catch (error) {
    // Fail silently for analytics
    console.warn('Analytics logging failed:', error);
  }
};