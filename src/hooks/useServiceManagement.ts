import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceData {
  id: string;
  category_id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  price_from?: number;
  price_unit?: string;
  capacity_min?: number;
  capacity_max?: number;
  amenities?: string[];
  images?: string[];
  active: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  created_at: string;
}

interface CreateServiceData {
  category_id: string;
  business_listing_id?: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  price_from?: number;
  price_unit?: string;
  capacity_min?: number;
  capacity_max?: number;
  amenities?: string[];
  images: string[];
  image_url: string;
  is_featured?: boolean;
  is_verified?: boolean;
}

export const useServiceManagement = (categoryId?: string, userOnly: boolean = false) => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      if (userOnly) {
        // Fetch only user's own services via their business listings
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setServices([]);
          setLoading(false);
          return;
        }

        // Get user's business listings
        const { data: businessListings, error: listingsError } = await supabase
          .from('business_listings')
          .select('id')
          .eq('user_id', user.id);

        if (listingsError) throw listingsError;

        if (!businessListings || businessListings.length === 0) {
          setServices([]);
          setLoading(false);
          return;
        }

        const businessListingIds = businessListings.map(b => b.id);

        // Fetch services linked to these business listings
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .in('business_listing_id', businessListingIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } else {
        // Fetch all services (for browsing)
        let query = supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setServices(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryId, userOnly]);

  const createService = async (serviceData: CreateServiceData) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          rating: 0,
          review_count: 0,
          response_time: '24h',
          availability_status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service created successfully",
      });

      fetchServices();
      return data;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateService = async (serviceId: string, updates: Partial<CreateServiceData>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service updated successfully",
      });

      fetchServices();
      return data;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });

      fetchServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ featured: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Service ${!currentStatus ? 'featured' : 'unfeatured'} successfully`,
      });

      fetchServices();
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    toggleFeatured,
    refreshServices: fetchServices
  };
};
