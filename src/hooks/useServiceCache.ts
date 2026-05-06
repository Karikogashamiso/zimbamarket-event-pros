import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceCache {
  services: unknown[];
  categories: unknown[];
  featuredServices: unknown[];
  lastFetched: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

let globalCache: ServiceCache | null = null;
let isLoading = false;
let loadingPromise: Promise<ServiceCache> | null = null;
const subscribers = new Set<() => void>();

export const useServiceCache = () => {
  const [cache, setCache] = useState<ServiceCache | null>(globalCache);
  const [loading, setLoading] = useState(isLoading);

  const fetchData = useCallback(async (): Promise<ServiceCache> => {
    // If already loading, return the existing promise
    if (loadingPromise) {
      return loadingPromise;
    }

    // Check if cache is still valid
    if (globalCache && Date.now() - globalCache.lastFetched < CACHE_DURATION) {
      return globalCache;
    }

    isLoading = true;
    subscribers.forEach(callback => callback());

    loadingPromise = (async () => {
      try {
        const [servicesResult, categoriesResult, featuredResult] = await Promise.all([
          supabase
            .from('services')
            .select('*, category:categories(name, slug)')
            .eq('active', true)
            .order('rating', { ascending: false }),
          
          supabase
            .from('categories')
            .select('*, services:services(count)')
            .order('name', { ascending: true }),
          
          supabase
            .from('services')
            .select('id, title, rating, price_from, category:categories(name)')
            .eq('active', true)
            .eq('featured', true)
            .order('rating', { ascending: false })
            .limit(10)
        ]);

        const newCache: ServiceCache = {
          services: servicesResult.data || [],
          categories: categoriesResult.data || [],
          featuredServices: featuredResult.data || [],
          lastFetched: Date.now()
        };

        globalCache = newCache;
        isLoading = false;
        loadingPromise = null;
        
        subscribers.forEach(callback => callback());
        return newCache;
      } catch (error) {
        console.error('Error fetching service data:', error);
        isLoading = false;
        loadingPromise = null;
        subscribers.forEach(callback => callback());
        throw error;
      }
    })();

    return loadingPromise;
  }, []);

  const refreshCache = useCallback(() => {
    globalCache = null;
    loadingPromise = null;
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    const updateState = () => {
      setCache(globalCache);
      setLoading(isLoading);
    };

    subscribers.add(updateState);
    
    // Initial fetch if no cache exists
    if (!globalCache && !isLoading) {
      fetchData();
    }

    return () => {
      subscribers.delete(updateState);
    };
  }, [fetchData]);

  return {
    services: cache?.services || [],
    categories: cache?.categories || [],
    featuredServices: cache?.featuredServices || [],
    loading,
    refreshCache,
    lastFetched: cache?.lastFetched || 0
  };
};