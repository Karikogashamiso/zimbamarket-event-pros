import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessListingFilters {
  query?: string;
  location?: string;
  category?: string;
  featured?: boolean;
  verified?: boolean;
  requireServices?: boolean;
}

export const useBusinessListings = (filters?: BusinessListingFilters) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      // If category filter is provided, fetch category UUID by slug first
      let categoryId: string | undefined;
      if (filters?.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        
        if (categoryData) {
          categoryId = categoryData.id;
        }
      }

      let query = supabase
        .from('business_listings')
        .select(`
          *,
          category:categories(id, name, slug, icon),
          services:services(
            id,
            title,
            description,
            active,
            is_featured,
            is_verified,
            rating,
            review_count,
            images,
            price_from,
            price_unit
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Apply filters
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.query) {
        query = query.or(`business_name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filter out listings with no active services and apply service-level filters
      const filteredData = data
        ?.map(listing => ({
          ...listing,
          services: listing.services?.filter((s: any) => s && s.active) || []
        }))
        .filter(listing => {
          // Only show listings that have at least one service (if required)
          if (filters?.requireServices && listing.services.length === 0) return false;

          // Apply verified filter to services
          if (filters?.verified) {
            listing.services = listing.services.filter((s: any) => s.is_verified);
            return listing.services.length > 0;
          }

          return true;
        });

      setListings(filteredData || []);
    } catch (err: any) {
      console.error('Error fetching business listings:', err);
      setError(err);
      toast({
        title: "Error",
        description: "Failed to load business listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [
    filters?.query,
    filters?.location,
    filters?.category,
    filters?.featured,
    filters?.verified
  ]);

  return {
    listings,
    loading,
    error,
    retry: fetchListings
  };
};
