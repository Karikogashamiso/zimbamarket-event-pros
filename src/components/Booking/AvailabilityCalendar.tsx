import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Users, DollarSign, CheckCircle, X } from 'lucide-react';
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvailabilitySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  price?: number;
  maxGuests?: number;
}

interface AvailabilityCalendarProps {
  serviceId: string;
  onBookingSelect?: (slot: AvailabilitySlot) => void;
  className?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  serviceId,
  onBookingSelect,
  className
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  // Mock availability data - in real app, this would come from your database
  const generateMockAvailability = (date: Date): AvailabilitySlot[] => {
    const slots: AvailabilitySlot[] = [];
    const today = new Date();
    
    // Don't show availability for past dates
    if (date < today) return slots;

    // Generate random availability for demo
    const timeSlots = [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '16:00' },
      { start: '17:00', end: '21:00' },
    ];

    timeSlots.forEach((timeSlot, index) => {
      // Random availability (70% chance of being available)
      const isAvailable = Math.random() > 0.3;
      
      if (isAvailable) {
        slots.push({
          id: `${format(date, 'yyyy-MM-dd')}-${index}`,
          date: date,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          isBooked: false,
          price: 150 + (index * 50), // Variable pricing
          maxGuests: 100 + (index * 50)
        });
      }
    });

    return slots;
  };

  // Get availability for selected date
  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const slots = generateMockAvailability(selectedDate);
        setAvailableSlots(slots);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedDate, serviceId]);

  // Get availability indicators for calendar
  const getAvailabilityForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => ({
      date: day,
      hasAvailability: generateMockAvailability(day).length > 0,
      isFullyBooked: false // You could implement this logic
    }));
  };

  const monthAvailability = getAvailabilityForMonth(currentMonth);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    onBookingSelect?.(slot);
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    try {
      const { error } = await supabase
        .from('booking_requests')
        .insert({
          service_id: serviceId,
          event_date: format(selectedSlot.date, 'yyyy-MM-dd'),
          message: `Requested time: ${selectedSlot.startTime} - ${selectedSlot.endTime} for ${guestCount} guests`,
        });

      if (error) throw error;

      toast({
        title: "Booking Request Sent",
        description: `Your request for ${selectedSlot.startTime} - ${selectedSlot.endTime} on ${format(selectedSlot.date, 'MMM d, yyyy')} has been submitted.`,
      });
      
      setSelectedSlot(null);
      setSelectedDate(undefined);
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Custom day content to show availability indicators
  const renderDay = (day: Date) => {
    const dayAvailability = monthAvailability.find(item => 
      isSameDay(item.date, day)
    );

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{format(day, 'd')}</span>
        {dayAvailability?.hasAvailability && (
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        )}
        {dayAvailability?.isFullyBooked && (
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Check Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => renderDay(date)
                }}
              />
              
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Fully Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>No Availability</span>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              {selectedDate ? (
                <div>
                  <h3 className="font-semibold mb-4">
                    Available times for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="space-y-3">
                      {availableSlots.map((slot) => (
                        <Card
                          key={slot.id}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-md",
                            selectedSlot?.id === slot.id 
                              ? "ring-2 ring-primary bg-primary/5" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {slot.maxGuests && (
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>Up to {slot.maxGuests} guests</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {slot.price && (
                                  <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                                    <DollarSign className="w-4 h-4" />
                                    {slot.price}
                                  </div>
                                )}
                                {selectedSlot?.id === slot.id && (
                                  <Badge className="mt-1">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No availability for this date</p>
                      <p className="text-sm">Please try another date</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a date to view availability</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Section */}
          {selectedSlot && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-4">Complete Your Booking</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Selected Date</label>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedSlot.date, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Time Slot</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Number of Guests</label>
                  <Select value={guestCount.toString()} onValueChange={(value) => setGuestCount(parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(selectedSlot.maxGuests || 100, 20) }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'guest' : 'guests'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    Total: ${selectedSlot.price || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSlot(null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleBooking}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;