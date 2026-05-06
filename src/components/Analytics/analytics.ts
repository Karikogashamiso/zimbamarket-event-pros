// Analytics tracking utilities - separated for fast-refresh compatibility

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const trackEvent = (
  eventName: string,
  parameters?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
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

export const trackSearch = (searchTerm: string, location?: string, category?: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    location,
    search_category: category,
    category: 'search',
  });
};

export const trackBooking = (serviceId: string, amount?: number) => {
  trackEvent('booking_request', {
    service_id: serviceId,
    value: amount,
    category: 'booking',
  });
};

export const trackServiceView = (serviceId: string, serviceName: string) => {
  trackEvent('view_item', {
    item_id: serviceId,
    item_name: serviceName,
    category: 'service_view',
  });
};

export const trackUserEngagement = (action: string, details?: Record<string, unknown>) => {
  trackEvent('user_engagement', {
    engagement_action: action,
    category: 'engagement',
    ...details,
  });
};
