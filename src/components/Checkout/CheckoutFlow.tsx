import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Shield, X } from 'lucide-react';
import { EventSelection } from './EventSelection';
import { SeatSelection } from './SeatSelection';
import { TicketTiers } from './TicketTiers';
import { AddOnsSelection } from './AddOnsSelection';
import { CustomerInfo } from './CustomerInfo';
import { PaymentOptions } from './PaymentOptions';
import { OrderSummary } from './OrderSummary';
import { TicketConfirmation } from './TicketConfirmation';
import { useSimpleCheckout } from '@/hooks/useSimpleCheckout';
import { useToast } from '@/hooks/use-toast';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export interface CheckoutData {
  event?: {
    id: string;
    title: string;
    venue: string;
    ticket_types?: unknown[];
    event_addons?: unknown[];
  };
  selectedSeats?: unknown[];
  ticketTiers?: Array<{
    ticketTypeId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  addOns?: unknown[];
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    termsAccepted?: boolean;
  };
  paymentMethod?: string;
  totalAmount?: number;
  currency?: string;
}

export type CheckoutStep =
  | 'event' 
  | 'seats' 
  | 'tiers' 
  | 'addons' 
  | 'customer' 
  | 'payment' 
  | 'summary' 
  | 'confirmation';

const STEPS: { key: CheckoutStep; title: string; description: string }[] = [
  { key: 'event', title: 'Select Event', description: 'Choose your event or trip' },
  { key: 'seats', title: 'Choose Seats', description: 'Select your preferred seats' },
  { key: 'tiers', title: 'Ticket Type', description: 'Select ticket categories' },
  { key: 'addons', title: 'Add-Ons', description: 'Enhance your experience' },
  { key: 'customer', title: 'Your Details', description: 'Contact information' },
  { key: 'payment', title: 'Payment', description: 'Choose payment method' },
  { key: 'summary', title: 'Review', description: 'Confirm your order' },
  { key: 'confirmation', title: 'Complete', description: 'Booking confirmed' }
];

export const CheckoutFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const tripId = searchParams.get('tripId');
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('tiers');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    selectedSeats: [],
    ticketTiers: [],
    addOns: [],
    totalAmount: 0,
    currency: 'USD'
  });
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const [isOwnEvent, setIsOwnEvent] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  
  const { processCheckout, isProcessing } = useSimpleCheckout();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();


  // Check if user owns the event
  useEffect(() => {
    const checkEventOwnership = async () => {
      if (!user || !eventId) {
        setCheckingOwnership(false);
        setIsOwnEvent(false);
        return;
      }

      try {
        const { data: ownership, error } = await supabase
          .rpc('user_owns_event', {
            event_id_param: eventId,
            user_id_param: user.id
          });

        if (error) {
          console.error('Error checking event ownership:', error);
          setCheckingOwnership(false);
          return;
        }

        setIsOwnEvent(ownership === true);
        
        if (ownership === true) {
          toast({
            title: "Cannot Purchase Own Tickets",
            description: "Event organizers cannot buy tickets for their own events.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkEventOwnership();
  }, [user, eventId, toast]);

  // Calculate total amount helper
  const calculateTotal = useCallback((tiers: {price: number; quantity: number}[] = [], addons: {price: number; quantity: number}[] = []) => {
    const tiersTotal = tiers.reduce((sum, tier) => sum + (tier.price * tier.quantity), 0);
    const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    return tiersTotal + addonsTotal;
  }, []);

  // Fetch event/trip data on mount
  useEffect(() => {
    const fetchEventData = async () => {
      setLoadingEvent(true);
      try {
        if (eventId) {
          console.log('Fetching event with ID:', eventId);
          const { data, error } = await supabase
            .from('events')
            .select(`
              id,
              title,
              description,
              start_datetime,
              end_datetime,
              event_category,
              featured_image,
              venue:venues(name, city, address),
              ticket_types(id, name, description, base_price, currency, max_quantity, is_active),
              event_addons(id, name, description, price, currency, category, max_quantity, is_active)
            `)
            .eq('id', eventId)
            .single();

          console.log('Event fetch result:', { data, error });

          if (error) throw error;
          
          if (data) {
            console.log('Setting event data:', data);
            // Convert venue object to string for validation
            const venue = data.venue 
              ? `${data.venue.name || ''}, ${data.venue.city || ''}` 
              : '';
            
            updateCheckoutData({ 
              event: {
                ...data,
                venue
              } as any
            });
          }
        } else if (tripId) {
          const { data, error } = await supabase
            .from('transport_trips')
            .select(`
              id,
              trip_number,
              departure_datetime,
              arrival_datetime,
              route:transport_routes(
                route_name,
                transport_type,
                origin_venue:venues!transport_routes_origin_venue_id_fkey(name, city),
                destination_venue:venues!transport_routes_destination_venue_id_fkey(name, city)
              ),
              ticket_types(id, name, description, base_price, currency, is_active),
              addons:event_addons(id, name, description, price, currency, category, is_active)
            `)
            .eq('id', tripId)
            .single();

          if (error) throw error;
          
          if (data) {
            // Format transport trip data to match event structure
            const route = data.route as any;
            const originVenue = route?.origin_venue;
            const destVenue = route?.destination_venue;
            
            const formattedEvent = {
              id: data.id,
              title: `${route?.route_name || 'Transport'} - ${originVenue?.city || ''} to ${destVenue?.city || ''}`,
              type: 'transport' as const,
              date: data.departure_datetime,
              venue: `${originVenue?.name || ''} → ${destVenue?.name || ''}`,
              ticket_types: data.ticket_types,
              event_addons: data.addons,
              trip_number: data.trip_number,
              departure_datetime: data.departure_datetime,
              arrival_datetime: data.arrival_datetime,
            };
            
            updateCheckoutData({ 
              event: formattedEvent as any
            });
          }
        }
      } catch (error: unknown) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingEvent(false);
      }
    };

    if (eventId || tripId) {
      fetchEventData();
    } else {
      setLoadingEvent(false);
      toast({
        title: "No Event Selected",
        description: "Please select an event or trip first.",
        variant: "destructive",
      });
    }
  }, [eventId, tripId, toast, updateCheckoutData]);

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100;

  const updateCheckoutData = useCallback((updates: Partial<CheckoutData>) => {
    const updatedData = { ...checkoutData, ...updates };
    
    // Recalculate total when ticket tiers or add-ons change
    if (updates.ticketTiers || updates.addOns) {
      const total = calculateTotal(
        updatedData.ticketTiers || [], 
        updatedData.addOns || []
      );
      updatedData.totalAmount = total;
    }
    
    setCheckoutData(updatedData);
  }, [checkoutData, calculateTotal]);

  const handleConfirmOrder = async () => {
    // Prevent duplicate order creation
    if (orderCreated) {
      toast({
        title: "Order Already Created",
        description: "Redirecting to your order...",
      });
      return;
    }

    try {
      console.log('Confirming order with data:', checkoutData);
      
      setOrderCreated(true);
      // Process checkout - navigation happens inside processCheckout
      await processCheckout(checkoutData);
      
    } catch (error) {
      console.error('Order confirmation failed:', error);
      setOrderCreated(false);
      // Error handling is done in useSimpleCheckout
    }
  };

  const goToNextStep = async () => {
    // Special handling for summary step - process the order
    if (currentStep === 'summary') {
      await handleConfirmOrder();
      return;
    }
    
    // Get next step, skipping add-ons if none available
    let nextIndex = currentStepIndex + 1;
    
    // Skip add-ons step if no add-ons available
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex].key;
      if (nextStep === 'addons') {
        const hasAddOns = checkoutData.event?.event_addons && 
                         checkoutData.event.event_addons.length > 0;
        if (!hasAddOns) {
          nextIndex++; // Skip to the step after add-ons
        }
      }
      
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex].key);
      }
    }
  };

  const goToPreviousStep = () => {
    // Get previous step, skipping add-ons if none available
    let prevIndex = currentStepIndex - 1;
    
    // Skip add-ons step if no add-ons available
    if (prevIndex >= 0) {
      const prevStep = STEPS[prevIndex].key;
      if (prevStep === 'addons') {
        const hasAddOns = checkoutData.event?.event_addons && 
                         checkoutData.event.event_addons.length > 0;
        if (!hasAddOns) {
          prevIndex--; // Skip to the step before add-ons
        }
      }
      
      if (prevIndex >= 0) {
        setCurrentStep(STEPS[prevIndex].key);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'tiers':
        return checkoutData.ticketTiers && checkoutData.ticketTiers.length > 0;
      case 'addons':
        return true; // Add-ons are optional
      case 'customer':
        return !!checkoutData.customerInfo?.email && 
               !!checkoutData.customerInfo?.firstName && 
               !!checkoutData.customerInfo?.termsAccepted;
      case 'payment':
        return !!checkoutData.paymentMethod;
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    if (checkingOwnership) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking access...</p>
          </CardContent>
        </Card>
      );
    }

    if (isOwnEvent) {
      return (
        <Card className="border-destructive">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Cannot Purchase Tickets</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              As the organizer of this event, you cannot purchase tickets for yourself. 
              This restriction is in place to maintain transparency and prevent conflicts of interest.
            </p>
            <Button 
              onClick={() => navigate('/events')}
              className="mt-4"
            >
              Browse Other Events
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (loadingEvent) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event details...</p>
          </CardContent>
        </Card>
      );
    }

    if (!checkoutData.event) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No event selected</p>
          </CardContent>
        </Card>
      );
    }

    switch (currentStep) {
      case 'tiers':
        return (
          <TicketTiers
            event={checkoutData.event}
            selectedSeats={checkoutData.selectedSeats || []}
            selectedTiers={checkoutData.ticketTiers || []}
            onTiersChange={(tiers) => updateCheckoutData({ ticketTiers: tiers })}
          />
        );
      case 'addons':
        return (
          <AddOnsSelection
            event={checkoutData.event}
            selectedAddOns={checkoutData.addOns || []}
            onAddOnsChange={(addOns) => updateCheckoutData({ addOns })}
          />
        );
      case 'customer':
        return (
          <CustomerInfo
            customerInfo={checkoutData.customerInfo}
            onCustomerInfoChange={(info) => updateCheckoutData({ customerInfo: info })}
          />
        );
      case 'payment':
        return (
          <PaymentOptions
            totalAmount={checkoutData.totalAmount || 0}
            currency={checkoutData.currency || 'USD'}
            selectedMethod={checkoutData.paymentMethod}
            onPaymentMethodChange={(method) => updateCheckoutData({ paymentMethod: method })}
          />
        );
      case 'summary':
        return (
          <OrderSummary
            checkoutData={checkoutData}
            onConfirmOrder={handleConfirmOrder}
            isProcessing={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {!['tiers', 'confirmation'].includes(currentStep) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousStep}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="font-semibold text-lg">
                {STEPS[currentStepIndex]?.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {STEPS[currentStepIndex]?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentStepIndex + 1}/{STEPS.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-9 w-9 p-0"
              title="Cancel and go back"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <SectionErrorBoundary sectionName="checkout step">
          {renderStepContent()}
        </SectionErrorBoundary>
      </div>

      {/* Mobile Footer Navigation */}
      {currentStep !== 'confirmation' && !isOwnEvent && !checkingOwnership && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t">
          <div className="container mx-auto px-4 py-4 max-w-2xl">
            <div className="flex items-center justify-between gap-4">
              {/* Price Summary */}
              {checkoutData.totalAmount && checkoutData.totalAmount > 0 && (
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="font-semibold text-lg">
                    {checkoutData.currency === 'USD' ? '$' : 
                     checkoutData.currency === 'ZWL' ? 'Z$' : 'RTGS$'}
                    {checkoutData.totalAmount?.toLocaleString()}
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex gap-2">
                {!['tiers', 'confirmation'].includes(currentStep) && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed() || isProcessing}
                  className="min-w-[100px]"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : currentStep === 'summary' ? (
                    'Confirm Order'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      {(currentStep === 'payment' || currentStep === 'customer') && (
        <div className="fixed bottom-20 right-4 z-40">
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
            <Shield className="h-3 w-3" />
            Secure
          </Badge>
        </div>
      )}
    </div>
  );
};