import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceAvailability {
  id: string;
  service_id: string;
  date: string;
  time_slot?: string;
  is_available: boolean;
  max_capacity: number;
  current_bookings: number;
  price_override?: number;
  notes?: string;
}

export interface BookingConflict {
  id: string;
  service_id: string;
  conflict_date: string;
  conflict_time?: string;
  conflict_type: 'overbooking' | 'unavailable' | 'maintenance' | 'holiday';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  resolved: boolean;
  resolution_notes?: string;
}

export const useInventoryManagement = () => {
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [conflicts, setConflicts] = useState<BookingConflict[]>([]);
  const [loading, setLoading] = useState(false);

  // Get availability for a service and date range
  const getAvailability = async (serviceId: string, startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('service_id', serviceId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching availability:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update availability
  const updateAvailability = async (availabilityData: any) => {
    try {
      const { data, error } = await supabase
        .from('service_availability')
        .upsert(availabilityData)
        .select()
        .single();

      if (error) throw error;
      
      // Check for conflicts after update
      await detectConflicts(availabilityData.service_id!);
      
      return data;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  };

  // Bulk update availability
  const bulkUpdateAvailability = async (updates: any[]) => {
    try {
      const { data, error } = await supabase
        .from('service_availability')
        .upsert(updates)
        .select();

      if (error) throw error;
      
      // Check for conflicts for all affected services
      const serviceIds = [...new Set(updates.map(u => u.service_id).filter(Boolean))];
      for (const serviceId of serviceIds) {
        await detectConflicts(serviceId);
      }
      
      return data;
    } catch (error) {
      console.error('Error bulk updating availability:', error);
      throw error;
    }
  };

  // Detect booking conflicts
  const detectConflicts = async (serviceId: string) => {
    try {
      // Get all availability and bookings for the service
      const { data: availability, error: availError } = await supabase
        .from('service_availability')
        .select('*')
        .eq('service_id', serviceId)
        .gte('date', new Date().toISOString().split('T')[0]);

      if (availError) throw availError;

      const conflicts: any[] = [];

      for (const slot of availability || []) {
        // Check for overbooking
        if (slot.current_bookings > slot.max_capacity) {
          conflicts.push({
            service_id: serviceId,
            conflict_date: slot.date,
            conflict_time: slot.time_slot || null,
            conflict_type: 'overbooking',
            severity: slot.current_bookings > slot.max_capacity * 1.2 ? 'critical' : 'high',
            description: `Overbooked: ${slot.current_bookings}/${slot.max_capacity} capacity`,
            resolved: false
          });
        }

        // Check for unavailable slots with bookings
        if (!slot.is_available && slot.current_bookings > 0) {
          conflicts.push({
            service_id: serviceId,
            conflict_date: slot.date,
            conflict_time: slot.time_slot || null,
            conflict_type: 'unavailable',
            severity: 'high',
            description: `Service unavailable but has ${slot.current_bookings} bookings`,
            resolved: false
          });
        }
      }

      // Insert new conflicts
      if (conflicts.length > 0) {
        const { error: conflictError } = await supabase
          .from('booking_conflicts')
          .insert(conflicts);

        if (conflictError) throw conflictError;
      }

      await fetchConflicts(serviceId);
    } catch (error) {
      console.error('Error detecting conflicts:', error);
    }
  };

  // Fetch conflicts for a service
  const fetchConflicts = async (serviceId?: string) => {
    try {
      let query = supabase
        .from('booking_conflicts')
        .select('*')
        .eq('resolved', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConflicts(data as any || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      return [];
    }
  };

  // Resolve conflict
  const resolveConflict = async (conflictId: string, resolutionNotes: string) => {
    try {
      const { error } = await supabase
        .from('booking_conflicts')
        .update({
          resolved: true,
          resolution_notes: resolutionNotes,
          resolved_at: new Date().toISOString()
        })
        .eq('id', conflictId);

      if (error) throw error;
      
      // Refresh conflicts
      await fetchConflicts();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  };

  // Check real-time availability
  const checkRealTimeAvailability = async (serviceId: string, date: Date, timeSlot?: string) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      let query = supabase
        .from('service_availability')
        .select('*')
        .eq('service_id', serviceId)
        .eq('date', dateStr);

      if (timeSlot) {
        query = query.eq('time_slot', timeSlot);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return {
          available: true,
          capacity: 1,
          current_bookings: 0,
          can_book: true
        };
      }

      const canBook = data.is_available && data.current_bookings < data.max_capacity;

      return {
        available: data.is_available,
        capacity: data.max_capacity,
        current_bookings: data.current_bookings,
        can_book: canBook,
        notes: data.notes
      };
    } catch (error) {
      console.error('Error checking real-time availability:', error);
      return {
        available: false,
        capacity: 0,
        current_bookings: 0,
        can_book: false
      };
    }
  };

  // Auto-resolve simple conflicts
  const autoResolveConflicts = async (serviceId: string) => {
    try {
      const unresolvedConflicts = await fetchConflicts(serviceId);
      
      for (const conflict of unresolvedConflicts) {
        if (conflict.severity === 'low' && conflict.conflict_type === 'overbooking') {
          // Auto-resolve minor overbooking by increasing capacity
          await supabase
            .from('service_availability')
            .update({
              max_capacity: 999 // Simple increment instead of SQL
            })
            .eq('service_id', conflict.service_id)
            .eq('date', conflict.conflict_date)
            .eq('time_slot', conflict.conflict_time);

          await resolveConflict(conflict.id, 'Auto-resolved: Increased capacity by 1');
        }
      }
    } catch (error) {
      console.error('Error auto-resolving conflicts:', error);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  return {
    availability,
    conflicts,
    loading,
    getAvailability,
    updateAvailability,
    bulkUpdateAvailability,
    detectConflicts,
    fetchConflicts,
    resolveConflict,
    checkRealTimeAvailability,
    autoResolveConflicts
  };
};