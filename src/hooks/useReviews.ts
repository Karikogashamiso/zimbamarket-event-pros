import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  service_id: string;
  reviewer_name: string;
  rating: number;
  comment?: string;
  helpful_count: number;
  created_at: string;
}

export const useReviews = (serviceId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('service_id', serviceId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          setError(error.message);
          return;
        }

        setReviews(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchReviews();
    }
  }, [serviceId]);

  return { reviews, loading, error };
};