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
  created_at: string;
}

interface CreateServiceData {
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
}

export const useServiceManagement = (categoryId?: string) => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      
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
  }, [categoryId]);

  const createService = async (serviceData: CreateServiceData) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          active: true,
          rating: 0,
          review_count: 0,
          response_time: '24h',
          availability_status: 'available',
          featured: false,
          verified: false
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
      const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service updated successfully",
      });

      fetchServices();
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
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

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    refreshServices: fetchServices
  };
};
