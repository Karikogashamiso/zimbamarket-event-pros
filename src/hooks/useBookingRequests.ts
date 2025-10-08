import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  total_amount?: number;
  created_at: string;
}

export const useBookingRequests = (organizerId?: string) => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (!organizerId) return;
    
    try {
      setLoading(true);
      
      // Try to get services linked to business listings first
      const { data: businessData, error: businessError } = await supabase
        .from('business_listings')
        .select('id, category_id')
        .eq('user_id', organizerId);

      if (businessError) throw businessError;

      let serviceIds: string[] = [];

      // Get services linked to business listings
      if (businessData && businessData.length > 0) {
        const businessListingIds = businessData.map(b => b.id);
        const { data: linkedServices, error: linkedError } = await supabase
          .from('services')
          .select('id')
          .in('business_listing_id', businessListingIds);

        if (linkedError) throw linkedError;
        serviceIds = linkedServices?.map(s => s.id) || [];
      }

      // Also get services by category_id where business_listing_id is null
      // This handles services created before business listings existed
      const { data: categoryServices, error: categoryError } = await supabase
        .from('services')
        .select('id, category_id')
        .is('business_listing_id', null);

      if (categoryError) throw categoryError;

      // Add these service IDs as well
      const orphanServiceIds = categoryServices?.map(s => s.id) || [];
      serviceIds = [...new Set([...serviceIds, ...orphanServiceIds])];

      if (serviceIds.length === 0) {
        setRequests([]);
        return;
      }

      // Fetch booking requests for all these services
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*, services(title, category_id)')
        .in('service_id', serviceIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching booking requests:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [organizerId]);

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
    } catch (error: any) {
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
