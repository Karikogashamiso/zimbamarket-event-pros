import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  amenities?: string[];
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

export interface SearchFilters {
  query?: string;
  location?: string;
  category?: string;
  priceRange?: string;
  rating?: string;
  featured?: boolean;
}

export const useServices = (filters?: SearchFilters) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
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

        if (filters?.rating && filters.rating !== 'all') {
          const minRating = parseFloat(filters.rating);
          query = query.gte('rating', minRating);
        }

        if (filters?.featured) {
          query = query.eq('featured', true);
        }

        // Price range filtering
        if (filters?.priceRange && filters.priceRange !== 'all') {
          const priceRange = filters.priceRange;
          if (priceRange === '$0-$100') {
            query = query.lte('price_from', 100);
          } else if (priceRange === '$100-$500') {
            query = query.gte('price_from', 100).lte('price_from', 500);
          } else if (priceRange === '$500-$1000') {
            query = query.gte('price_from', 500).lte('price_from', 1000);
          } else if (priceRange === '$1000+') {
            query = query.gte('price_from', 1000);
          }
        }

        // Order by featured first, then by rating
        query = query.order('featured', { ascending: false })
                    .order('rating', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching services:', error);
          setError(error.message);
          return;
        }

        setServices(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [filters?.query, filters?.location, filters?.category, filters?.priceRange, filters?.rating, filters?.featured]);

  return { services, loading, error };
};

export const useService = (id: string) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            category:categories(name, slug)
          `)
          .eq('id', id)
          .eq('active', true)
          .single();

        if (error) {
          console.error('Error fetching service:', error);
          setError(error.message);
          return;
        }

        setService(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch service');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  return { service, loading, error };
};