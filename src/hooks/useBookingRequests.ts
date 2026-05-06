import { useState, useEffect, useCallback} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface BookingRequest {
  id: string;
  service_id: string;
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  event_date?: string;
  message?: string;
  status: string;
  payment_status?: string;
  total_amount?: number;
  created_at: string;
  services?: {
    title: string;
    business_listing_id: string;
    business_listings?: {
      business_name: string;
    };
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const useBookingRequests = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get business listings for this user
      const { data: businessData, error: businessError } = await supabase
        .from('business_listings')
        .select('id')
        .eq('user_id', user.id);

      if (businessError) throw businessError;

      if (!businessData || businessData.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Get all services linked to these business listings
      const businessListingIds = businessData.map(b => b.id);
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, title')
        .in('business_listing_id', businessListingIds);

      if (servicesError) throw servicesError;

      const serviceIds = servicesData?.map(s => s.id) || [];

      if (serviceIds.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Fetch booking requests for these services
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          services!inner(
            title,
            business_listing_id,
            business_listings(
              business_name
            )
          )
        `)
        .in('service_id', serviceIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for requests with user_id
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          if (request.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', request.user_id)
              .maybeSingle();
            
            return { ...request, profiles: profile };
          }
          return { ...request, profiles: null };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error: unknown) {
      console.error('Error fetching booking requests:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id, fetchRequests]);

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking request ${status}`,
      });

      fetchRequests();
    } catch (error: unknown) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update booking request",
        variant: "destructive",
      });
    }
  };

  return {
    requests,
    loading,
    updateRequestStatus,
    refreshRequests: fetchRequests
  };
};
