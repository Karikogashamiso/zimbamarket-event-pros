import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPreferences {
  preferredCategories: string[];
  budget: { min: number; max: number };
  preferredLocations: string[];
  eventTypes: string[];
  lastSearches: string[];
  viewedServices: string[];
  savedServices: string[];
}

interface RecommendationScore {
  serviceId: string;
  score: number;
  reasons: string[];
}

export const useSmartRecommendations = (userId?: string) => {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track user behavior
  const trackServiceView = (serviceId: string, category: string, location: string) => {
    if (!userId) return;

    // Update viewed services in preferences
    const updatedPreferences = {
      ...userPreferences,
      viewedServices: [...(userPreferences?.viewedServices || []), serviceId].slice(-50), // Keep last 50
      preferredCategories: updateFrequency(userPreferences?.preferredCategories || [], category),
      preferredLocations: updateFrequency(userPreferences?.preferredLocations || [], location),
    };

    setUserPreferences(updatedPreferences);
    savePreferences(updatedPreferences);
  };

  const trackSearch = (query: string, category?: string, location?: string) => {
    if (!userId) return;

    const updatedPreferences = {
      ...userPreferences,
      lastSearches: [query, ...(userPreferences?.lastSearches || [])].slice(0, 20),
      ...(category && { 
        preferredCategories: updateFrequency(userPreferences?.preferredCategories || [], category) 
      }),
      ...(location && { 
        preferredLocations: updateFrequency(userPreferences?.preferredLocations || [], location) 
      }),
    };

    setUserPreferences(updatedPreferences);
    savePreferences(updatedPreferences);
  };

  const saveService = (serviceId: string) => {
    if (!userId) return;

    const updatedPreferences = {
      ...userPreferences,
      savedServices: [...(userPreferences?.savedServices || []), serviceId],
    };

    setUserPreferences(updatedPreferences);
    savePreferences(updatedPreferences);
  };

  // Helper function to update frequency-based preferences
  const updateFrequency = (currentList: string[], newItem: string): string[] => {
    const updated = [newItem, ...currentList.filter(item => item !== newItem)];
    return updated.slice(0, 10); // Keep top 10
  };

  // Save preferences to local storage only for now
  const savePreferences = async (preferences: UserPreferences) => {
    try {
      // Save to localStorage for immediate access
      localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Load user preferences from localStorage only for now
  const loadPreferences = async () => {
    if (!userId) return;

    try {
      // Load from localStorage
      const stored = localStorage.getItem(`user_preferences_${userId}`);
      if (stored) {
        setUserPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Generate smart recommendations
  const generateRecommendations = async () => {
    if (!userPreferences) return;

    setIsLoading(true);

    try {
      // Get all active services
      const { data: services, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          location,
          price_from,
          rating,
          category:categories(name, slug),
          amenities,
          featured
        `)
        .eq('active', true);

      if (error || !services) {
        console.error('Error fetching services:', error);
        return;
      }

      // Calculate recommendation scores
      const scoredServices = services.map(service => {
        let score = 0;
        const reasons: string[] = [];

        // Category preference scoring
        if (userPreferences.preferredCategories.includes(service.category?.slug || '')) {
          const categoryIndex = userPreferences.preferredCategories.indexOf(service.category?.slug || '');
          score += (10 - categoryIndex) * 0.3; // Higher score for more preferred categories
          reasons.push(`Matches your interest in ${service.category?.name}`);
        }

        // Location preference scoring
        if (userPreferences.preferredLocations.some(loc => 
          service.location.toLowerCase().includes(loc.toLowerCase()))) {
          score += 0.25;
          reasons.push('In your preferred location');
        }

        // Budget compatibility
        if (service.price_from && userPreferences.budget) {
          if (service.price_from >= userPreferences.budget.min && 
              service.price_from <= userPreferences.budget.max) {
            score += 0.2;
            reasons.push('Within your budget range');
          }
        }

        // Rating bonus
        if (service.rating >= 4.5) {
          score += 0.15;
          reasons.push('Highly rated by customers');
        }

        // Featured service bonus
        if (service.featured) {
          score += 0.1;
          reasons.push('Featured service');
        }

        // Exclude already viewed services (for discovery)
        if (userPreferences.viewedServices.includes(service.id)) {
          score *= 0.7; // Reduce score but don't eliminate
        }

        // Exclude saved services from recommendations
        if (userPreferences.savedServices.includes(service.id)) {
          score *= 0.3;
        }

        // Similar users bonus (mock collaborative filtering)
        const similarityBonus = Math.random() * 0.1; // Simplified - in real app, this would be based on actual user similarity
        score += similarityBonus;

        return {
          serviceId: service.id,
          score: Math.round(score * 100) / 100,
          reasons: reasons.slice(0, 3) // Limit to top 3 reasons
        };
      });

      // Sort by score and take top recommendations
      const topRecommendations = scoredServices
        .filter(item => item.score > 0.1) // Minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      setRecommendations(topRecommendations);

    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get trending services (most viewed/booked recently)
  const getTrendingServices = async () => {
    try {
      // This would typically query view/booking analytics
      // For now, we'll return featured services as trending
      const { data: services, error } = await supabase
        .from('services')
        .select('id, title, rating, price_from, category:categories(name)')
        .eq('active', true)
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(10);

      return services || [];
    } catch (error) {
      console.error('Error fetching trending services:', error);
      return [];
    }
  };

  // Get services similar to a given service
  const getSimilarServices = async (serviceId: string, category: string) => {
    try {
      const { data: services, error } = await supabase
        .from('services')
        .select('id, title, rating, price_from, category:categories(name)')
        .eq('active', true)
        .eq('category.slug', category)
        .neq('id', serviceId)
        .order('rating', { ascending: false })
        .limit(6);

      return services || [];
    } catch (error) {
      console.error('Error fetching similar services:', error);
      return [];
    }
  };

  // Initialize preferences and recommendations
  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  useEffect(() => {
    if (userPreferences && userId) {
      generateRecommendations();
    }
  }, [userPreferences]);

  return {
    recommendations,
    userPreferences,
    isLoading,
    trackServiceView,
    trackSearch,
    saveService,
    getTrendingServices,
    getSimilarServices,
    generateRecommendations
  };
};