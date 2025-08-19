import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  serviceId: string;
  eventType: 'view' | 'inquiry' | 'booking' | 'conversion' | 'cancellation';
  eventData?: Record<string, any>;
}

export interface BusinessMetric {
  service_id: string;
  service_name: string;
  total_views: number;
  total_inquiries: number;
  total_bookings: number;
  total_conversions: number;
  inquiry_conversion_rate: number;
  booking_conversion_rate: number;
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<BusinessMetric[]>([]);
  const [loading, setLoading] = useState(false);

  // Track analytics event
  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      await supabase.from('booking_analytics').insert({
        service_id: event.serviceId,
        event_type: event.eventType,
        event_data: event.eventData || {},
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  };

  // Get business metrics
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .order('total_views', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh materialized view
  const refreshMetrics = async () => {
    try {
      await supabase.rpc('refresh_business_metrics');
      await fetchMetrics();
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    }
  };

  // Get session ID from localStorage or create new one
  const getSessionId = () => {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };

  // Get analytics for specific service
  const getServiceAnalytics = async (serviceId: string, days = 30) => {
    try {
      const { data, error } = await supabase
        .from('booking_analytics')
        .select('*')
        .eq('service_id', serviceId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching service analytics:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    trackEvent,
    fetchMetrics,
    refreshMetrics,
    getServiceAnalytics
  };
};