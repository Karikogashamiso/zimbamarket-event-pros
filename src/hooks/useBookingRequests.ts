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
      
      // First get business listings for this user
      const { data: businessData, error: businessError } = await supabase
        .from('business_listings')
        .select('category_id')
        .eq('user_id', organizerId);

      if (businessError) throw businessError;

      const categoryIds = businessData?.map(b => b.category_id) || [];

      if (categoryIds.length === 0) {
        setRequests([]);
        return;
      }

      // Get services for these categories
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .in('category_id', categoryIds);

      if (servicesError) throw servicesError;

      const serviceIds = servicesData?.map(s => s.id) || [];

      if (serviceIds.length === 0) {
        setRequests([]);
        return;
      }

      // Fetch booking requests for these services
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
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
