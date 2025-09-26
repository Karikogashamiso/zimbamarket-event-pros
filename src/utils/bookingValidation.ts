// Booking Form Integration Verification Utilities
import { supabase } from '@/integrations/supabase/client';

// Test booking form database connectivity
export const verifyBookingFormIntegration = async (): Promise<{
  isConnected: boolean;
  canInsert: boolean;
  serviceExists: boolean;
  latestBooking?: string;
  error?: string;
}> => {
  try {
    // Test read access to booking_requests
    const { data: countData, error: countError } = await supabase
      .from('booking_requests')
      .select('count(*)', { count: 'exact', head: true });

    if (countError) {
      return {
        isConnected: false,
        canInsert: false,
        serviceExists: false,
        error: `Read test failed: ${countError.message}`
      };
    }

    // Test services table access
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .limit(1);

    if (serviceError) {
      return {
        isConnected: true,
        canInsert: true,
        serviceExists: false,
        error: `Services table access failed: ${serviceError.message}`
      };
    }

    // Get latest booking
    const { data: latestData } = await supabase
      .from('booking_requests')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    const latestBooking = latestData?.[0]?.created_at || 'No bookings yet';

    return {
      isConnected: true,
      canInsert: true,
      serviceExists: serviceData && serviceData.length > 0,
      latestBooking
    };

  } catch (error: any) {
    return {
      isConnected: false,
      canInsert: false,
      serviceExists: false,
      error: `Integration test failed: ${error.message}`
    };
  }
};

// Sanitize booking form data before submission
export const sanitizeBookingData = (data: {
  serviceId: string;
  selectedDate?: string;
  message?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  userId?: string;
}) => {
  const sanitized: any = {
    service_id: data.serviceId,
    event_date: data.selectedDate || null,
    message: data.message?.trim() || null,
  };

  if (data.userId) {
    sanitized.user_id = data.userId;
  } else {
    sanitized.guest_name = data.guestName?.trim();
    sanitized.guest_email = data.guestEmail?.trim().toLowerCase();
    sanitized.guest_phone = data.guestPhone?.trim() || null;
  }

  return sanitized;
};

// Validate service ID exists
export const validateServiceExists = async (serviceId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Service validation error:', error);
    return false;
  }
};

// Log booking form analytics (non-PII)
export const logBookingAnalytics = async (success: boolean, errorType?: string, serviceId?: string) => {
  try {
    // Only log non-sensitive analytics data
    const analyticsData = {
      timestamp: new Date().toISOString(),
      success,
      errorType: errorType || null,
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      hasServiceId: !!serviceId
    };

    console.log('Booking Form Analytics:', analyticsData);

    // Try to log to database (optional)
    if (serviceId) {
      try {
        await supabase.from('booking_analytics').insert({
          service_id: serviceId,
          event_type: success ? 'booking_success' : 'booking_error',
          event_data: { error_type: errorType },
        });
      } catch (dbError) {
        // Silently fail analytics logging
        console.log('Database analytics logging failed:', dbError);
      }
    }
  } catch (error) {
    // Fail silently for analytics
    console.warn('Analytics logging failed:', error);
  }
};