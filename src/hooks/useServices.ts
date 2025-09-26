import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SearchFilters } from '@/components/Search/AdvancedSearch';

export interface Service {
  id: string;
  title: string;
  description: string;
  full_description?: string;
  category_id: string;
  location: string;
  address?: string;
  price_from?: number;
  price_unit: string;
  rating: number;
  review_count: number;
  phone_number?: string;
  email?: string;
  website?: string;
  capacity_min?: number;
  capacity_max?: number;
  response_time: string;
  availability_status: string;
  featured: boolean;
  verified: boolean;
  image_url?: string;
  images?: string[];
  amenities?: string[];
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  isRetrying: boolean;
}

export const useServices = (filters?: Partial<SearchFilters>): UseServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchServices = async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let query = supabase
        .from('services')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('active', true);

      // Apply filters
      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.category && filters.category !== 'all') {
        // Get category ID from slug
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters?.rating && filters.rating > 0) {
        query = query.gte('rating', filters.rating);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.verified) {
        query = query.eq('verified', true);
      }

      // Price range filtering
      if (filters?.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 10000)) {
        query = query.gte('price_from', filters.priceRange.min);
        if (filters.priceRange.max < 10000) {
          query = query.lte('price_from', filters.priceRange.max);
        }
      }

      // Capacity filtering
      if (filters?.capacity && (filters.capacity.min > 1 || filters.capacity.max < 1000)) {
        if (filters.capacity.min > 1) {
          query = query.gte('capacity_max', filters.capacity.min);
        }
        if (filters.capacity.max < 1000) {
          query = query.lte('capacity_min', filters.capacity.max);
        }
      }

      // Order based on sortBy
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price-low':
            query = query.order('price_from', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price_from', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          default:
            // Default: featured first, then by rating
            query = query.order('featured', { ascending: false })
                         .order('rating', { ascending: false });
        }
      } else {
        // Default: featured first, then by rating
        query = query.order('featured', { ascending: false })
                     .order('rating', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching services:', error);
        
        // Provide user-friendly error messages
        if (error.code === 'PGRST116') {
          throw new Error('No services found matching your criteria. Try adjusting your filters.');
        } else if (error.message.includes('connection')) {
          throw new Error('Unable to connect to our servers. Please check your internet connection.');
        } else if (error.message.includes('timeout')) {
          throw new Error('The request took too long. Please try again.');
        } else {
          throw new Error('Unable to load services at this time. Please try again in a moment.');
        }
      }

      setServices(data || []);
    } catch (err: any) {
      console.error('Services fetch error:', err);
      setError(err.message || 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const retry = () => fetchServices(true);

  useEffect(() => {
    fetchServices();
  }, [
    filters?.query, 
    filters?.location, 
    filters?.category, 
    filters?.priceRange?.min, 
    filters?.priceRange?.max, 
    filters?.rating, 
    filters?.featured, 
    filters?.verified,
    filters?.capacity?.min, 
    filters?.capacity?.max,
    filters?.sortBy
  ]);

  return { services, loading, error, retry, isRetrying };
};

interface UseServiceReturn {
  service: Service | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  isRetrying: boolean;
}

export const useService = (id: string): UseServiceReturn => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchService = async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('id', id)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching service:', error);
        
        if (error.code === 'PGRST116') {
          throw new Error('Service not found. It may have been removed or is no longer available.');
        } else if (error.message.includes('connection')) {
          throw new Error('Unable to connect to our servers. Please check your internet connection.');
        } else {
          throw new Error('Unable to load service details. Please try again.');
        }
      }

      if (!data) {
        throw new Error('Service not found. It may have been removed or is no longer available.');
      }

      setService(data);
    } catch (err: any) {
      console.error('Service fetch error:', err);
      setError(err.message || 'Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const retry = () => fetchService(true);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  return { service, loading, error, retry, isRetrying };
};