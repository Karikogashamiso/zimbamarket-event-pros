import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingModel {
  id: string;
  service_id: string;
  base_price: number;
  peak_multiplier: number;
  off_peak_multiplier: number;
  demand_threshold: number;
  seasonal_adjustments: any;
  dynamic_pricing_enabled: boolean;
}

export interface DynamicPrice {
  original_price: number;
  adjusted_price: number;
  multiplier: number;
  factors: string[];
}

export const useDynamicPricing = () => {
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate dynamic price based on demand, seasonality, and time
  const calculateDynamicPrice = async (serviceId: string, date: Date): Promise<DynamicPrice> => {
    try {
      const { data: pricingModel, error } = await supabase
        .from('pricing_models')
        .select('*')
        .eq('service_id', serviceId)
        .single();

      if (error || !pricingModel || !pricingModel.dynamic_pricing_enabled) {
        return {
          original_price: 0,
          adjusted_price: 0,
          multiplier: 1,
          factors: []
        };
      }

      let multiplier = 1;
      const factors: string[] = [];
      const basePrice = pricingModel.base_price;

      // Time-based pricing (peak/off-peak)
      const hour = date.getHours();
      if ((hour >= 18 && hour <= 23) || (hour >= 9 && hour <= 12)) {
        multiplier *= pricingModel.peak_multiplier;
        factors.push('Peak hours');
      } else if (hour >= 0 && hour <= 6) {
        multiplier *= pricingModel.off_peak_multiplier;
        factors.push('Off-peak hours');
      }

      // Seasonal adjustments
      const month = date.getMonth() + 1;
      const seasonalKey = `month_${month}`;
      if (pricingModel.seasonal_adjustments?.[seasonalKey]) {
        const seasonalMultiplier = pricingModel.seasonal_adjustments[seasonalKey];
        multiplier *= seasonalMultiplier;
        factors.push(`Seasonal (${getSeasonName(month)})`);
      }

      // Demand-based pricing
      const demand = await calculateDemand(serviceId, date);
      if (demand >= pricingModel.demand_threshold) {
        const demandMultiplier = 1 + ((demand - pricingModel.demand_threshold) / 100);
        multiplier *= Math.min(demandMultiplier, 2.0); // Cap at 2x
        factors.push(`High demand (${demand}%)`);
      }

      // Weekend premium
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        multiplier *= 1.2;
        factors.push('Weekend premium');
      }

      const adjustedPrice = Math.round(basePrice * multiplier * 100) / 100;

      return {
        original_price: basePrice,
        adjusted_price: adjustedPrice,
        multiplier: Math.round(multiplier * 100) / 100,
        factors
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      return {
        original_price: 0,
        adjusted_price: 0,
        multiplier: 1,
        factors: []
      };
    }
  };

  // Calculate current demand percentage
  const calculateDemand = async (serviceId: string, date: Date): Promise<number> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data: availability, error } = await supabase
        .from('service_availability')
        .select('max_capacity, current_bookings')
        .eq('service_id', serviceId)
        .eq('date', dateStr)
        .single();

      if (error || !availability) return 0;

      const capacity = availability.max_capacity || 1;
      const bookings = availability.current_bookings || 0;
      
      return Math.round((bookings / capacity) * 100);
    } catch (error) {
      console.error('Error calculating demand:', error);
      return 0;
    }
  };

  // Get season name for display
  const getSeasonName = (month: number): string => {
    if (month >= 12 || month <= 2) return 'Summer'; // Zimbabwe summer
    if (month >= 3 && month <= 5) return 'Autumn';
    if (month >= 6 && month <= 8) return 'Winter';
    return 'Spring';
  };

  // Create or update pricing model
  const updatePricingModel = async (model: any) => {
    try {
      const { data, error } = await supabase
        .from('pricing_models')
        .upsert(model)
        .select()
        .single();

      if (error) throw error;
      await fetchPricingModels();
      return data;
    } catch (error) {
      console.error('Error updating pricing model:', error);
      throw error;
    }
  };

  // Fetch all pricing models for current user's services
  const fetchPricingModels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPricingModels(data || []);
    } catch (error) {
      console.error('Error fetching pricing models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get pricing trends for a service
  const getPricingTrends = async (serviceId: string, days = 30) => {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const trends = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const price = await calculateDynamicPrice(serviceId, date);
        trends.push({
          date: date.toISOString().split('T')[0],
          price: price.adjusted_price,
          demand: await calculateDemand(serviceId, date)
        });
      }
      
      return trends;
    } catch (error) {
      console.error('Error getting pricing trends:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPricingModels();
  }, []);

  return {
    pricingModels,
    loading,
    calculateDynamicPrice,
    updatePricingModel,
    fetchPricingModels,
    getPricingTrends,
    calculateDemand
  };
};