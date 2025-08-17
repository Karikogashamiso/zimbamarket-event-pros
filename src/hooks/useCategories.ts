import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  slug: string;
  created_at: string;
  service_count?: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories with service counts
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            services:services(count)
          `)
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          setError(error.message);
          return;
        }

        // Transform data to include service counts
        const categoriesWithCounts = data?.map(category => ({
          ...category,
          service_count: category.services?.[0]?.count || 0
        })) || [];

        setCategories(categoriesWithCounts);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};