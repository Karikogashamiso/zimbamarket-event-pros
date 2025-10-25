import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
        <Button variant="outline" className="w-full group hover:border-primary/50 transition-colors">
          <Calendar className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
          Check Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Check Availability
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{serviceName}</p>
        </DialogHeader>
        
        <div className="space-y-6 py-6 overflow-y-auto flex-1">
          {/* Date Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12 text-base border-2 focus:border-primary transition-colors"
            />
          </div>

          {/* Availability Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
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
              <div className="text-center py-12">
                <div className="relative mx-auto w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-muted-foreground font-medium">Checking availability...</p>
              </div>
            ) : availability.length > 0 ? (
              <div className="space-y-3">
                {availability.map((slot, index) => {
                  const availabilityInfo = getAvailabilityStatus(slot);
                  const remainingCapacity = slot.max_capacity - slot.current_bookings;
                  const price = slot.price_override || basePrice;
                  const isAvailable = availabilityInfo.status === 'available';
                  const isFullyBooked = availabilityInfo.status === 'unavailable';
                  
                  return (
                    <div 
                      key={slot.id} 
                      className={cn(
                        "group relative flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300",
                        "hover:shadow-lg animate-in fade-in slide-in-from-bottom-2",
                        isFullyBooked 
                          ? "bg-muted/30 border-muted opacity-60" 
                          : "bg-card border-border hover:border-primary/50 hover:bg-accent/5"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
                          isFullyBooked ? "bg-destructive/10" : "bg-primary/10 group-hover:bg-primary/20"
                        )}>
                          <Clock className={cn(
                            "w-5 h-5 transition-colors",
                            isFullyBooked ? "text-destructive" : "text-primary"
                          )} />
                        </div>
                        
                        <div className="space-y-2">
                          <span className="font-semibold text-lg text-foreground">
                            {formatTime(slot.time_slot)}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={isFullyBooked ? "destructive" : "default"}
                              className={cn(
                                "font-medium px-3 py-1 flex items-center gap-1.5",
                                isAvailable && "bg-primary text-primary-foreground"
                              )}
                            >
                              {isFullyBooked ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              {availabilityInfo.text}
                            </Badge>
                            
                            {slot.is_available && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                <Users className="w-4 h-4" />
                                <span>{remainingCapacity} spots left</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {price && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">
                              ${price}
                            </div>
                            {slot.price_override && (
                              <div className="flex items-center gap-1 text-xs text-primary font-medium mt-0.5">
                                <Sparkles className="w-3 h-3" />
                                Peak pricing
                              </div>
                            )}
                          </div>
                        )}
                        
                        <Button
                          size="lg"
                          disabled={!isAvailable}
                          className={cn(
                            "min-w-[120px] font-semibold transition-all duration-300",
                            isAvailable && "hover:scale-105 shadow-md hover:shadow-xl"
                          )}
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
                                title: "✅ Booking Request Sent",
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
                          {isAvailable ? 'Book Now' : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No availability information for this date</p>
                  <p className="text-sm text-muted-foreground mt-1">Please contact the service provider directly</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};