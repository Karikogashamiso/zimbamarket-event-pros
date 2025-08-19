import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface GoogleAnalyticsProps {
  measurementId: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId }) => {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // Initialize GA
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Track page views on route changes
    const handleRouteChange = () => {
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
      });
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [measurementId]);

  return (
    <Helmet>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </Helmet>
  );
};

// Enhanced event tracking utilities
export const trackEvent = (
  eventName: string, 
  parameters?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters?.category || 'engagement',
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters,
    });
  }
};

// Track search events
export const trackSearch = (searchTerm: string, location?: string, category?: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    location: location,
    search_category: category,
    category: 'search',
  });
};

// Track booking events
export const trackBooking = (serviceId: string, amount?: number) => {
  trackEvent('booking_request', {
    service_id: serviceId,
    value: amount,
    category: 'booking',
  });
};

// Track business listing views
export const trackServiceView = (serviceId: string, serviceName: string) => {
  trackEvent('view_item', {
    item_id: serviceId,
    item_name: serviceName,
    category: 'service_view',
  });
};

// Track user engagement
export const trackUserEngagement = (action: string, details?: any) => {
  trackEvent('user_engagement', {
    engagement_action: action,
    category: 'engagement',
    ...details,
  });
};

export default GoogleAnalytics;