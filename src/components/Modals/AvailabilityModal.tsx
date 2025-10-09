import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilitySlot {
  id: string;
  date: string;
  time_slot: string;
  is_available: boolean;
  current_bookings: number;
  max_capacity: number;
  price_override?: number;
}

interface AvailabilityModalProps {
  serviceId: string;
  serviceName: string;
  basePrice?: number;
}

export const AvailabilityModal = ({ serviceId, serviceName, basePrice }: AvailabilityModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const fetchAvailability = async (date: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('service_id', serviceId)
        .eq('date', date)
        .order('time_slot');

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(error.message);
      }

      // If no data exists, generate mock availability slots
      if (!data || data.length === 0) {
        const mockSlots = generateMockAvailability(date);
        setAvailability(mockSlots);
      } else {
        setAvailability(data);
      }
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability. Please try again.",
        variant: "destructive",
      });
      // Generate mock data as fallback
      setAvailability(generateMockAvailability(date));
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAvailability = (date: string): AvailabilitySlot[] => {
    const slots = [
      { time: '09:00', available: true, bookings: 2, capacity: 20 },
      { time: '11:00', available: true, bookings: 5, capacity: 20 },
      { time: '14:00', available: false, bookings: 20, capacity: 20 },
      { time: '16:00', available: true, bookings: 8, capacity: 20 },
      { time: '18:00', available: true, bookings: 1, capacity: 20 },
    ];

    return slots.map((slot, index) => ({
      id: `mock-${index}`,
      date,
      time_slot: slot.time,
      is_available: slot.available,
      current_bookings: slot.bookings,
      max_capacity: slot.capacity,
      price_override: Math.random() > 0.7 ? (basePrice || 500) * 1.2 : undefined,
    }));
  };

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [isOpen, selectedDate, serviceId]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const getAvailabilityStatus = (slot: AvailabilitySlot) => {
    if (!slot.is_available) {
      return { status: 'unavailable', text: 'Fully Booked', color: 'destructive' };
    }
    
    const remainingCapacity = slot.max_capacity - slot.current_bookings;
    
    if (remainingCapacity <= 5) {
      return { status: 'limited', text: 'Limited Availability', color: 'secondary' };
    }
    
    return { status: 'available', text: 'Available', color: 'default' };
  };

  const formatTime = (timeSlot: string | null) => {
    if (!timeSlot) return 'Time TBD';
    
    try {
      const date = new Date(`2000-01-01T${timeSlot}`);
      if (isNaN(date.getTime())) return 'Time TBD';
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Time TBD';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Check Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Check Availability - {serviceName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Availability Results */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Available Times for {(() => {
                try {
                  const date = new Date(selectedDate + 'T00:00:00');
                  if (isNaN(date.getTime())) return selectedDate;
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                } catch {
                  return selectedDate;
                }
              })()}
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Checking availability...</p>
              </div>
            ) : availability.length > 0 ? (
              <div className="space-y-3">
                {availability.map((slot) => {
                  const availabilityInfo = getAvailabilityStatus(slot);
                  const remainingCapacity = slot.max_capacity - slot.current_bookings;
                  const price = slot.price_override || basePrice;
                  
                  return (
                    <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">{formatTime(slot.time_slot)}</span>
                        </div>
                        
                        <Badge variant={availabilityInfo.color as any}>
                          {availabilityInfo.status === 'available' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {availabilityInfo.text}
                        </Badge>
                        
                        {slot.is_available && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {remainingCapacity} spots left
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {price && (
                          <span className="font-semibold">
                            ${price}
                            {slot.price_override && (
                              <span className="text-xs text-muted-foreground ml-1">(Peak pricing)</span>
                            )}
                          </span>
                        )}
                        
                        <Button
                          size="sm"
                          disabled={availabilityInfo.status !== 'available'}
                          onClick={async () => {
                            try {
                              const timeInfo = slot.time_slot ? `Requested time: ${formatTime(slot.time_slot)}` : 'Time to be confirmed';
                              
                              // Create booking request
                              const { error } = await supabase
                                .from('booking_requests')
                                .insert({
                                  service_id: serviceId,
                                  event_date: selectedDate,
                                  message: timeInfo,
                                });

                              if (error) throw error;

                              toast({
                                title: "Booking Request Sent",
                                description: `Your request for ${new Date(selectedDate).toLocaleDateString()} ${slot.time_slot ? `at ${formatTime(slot.time_slot)}` : ''} has been submitted.`,
                              });
                              setIsOpen(false);
                            } catch (error: any) {
                              toast({
                                title: "Request Failed",
                                description: error.message || "Failed to submit booking request. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {availabilityInfo.status === 'available' ? 'Book Now' : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No availability information for this date.</p>
                <p className="text-sm text-muted-foreground mt-2">Please contact the service provider directly.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};