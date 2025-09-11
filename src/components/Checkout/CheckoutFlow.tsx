import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Shield } from 'lucide-react';
import { EventSelection } from './EventSelection';
import { SeatSelection } from './SeatSelection';
import { TicketTiers } from './TicketTiers';
import { AddOnsSelection } from './AddOnsSelection';
import { CustomerInfo } from './CustomerInfo';
import { PaymentOptions } from './PaymentOptions';
import { OrderSummary } from './OrderSummary';
import { TicketConfirmation } from './TicketConfirmation';

export type CheckoutStep = 'event' | 'seats' | 'tiers' | 'addons' | 'customer' | 'payment' | 'summary' | 'confirmation';

interface CheckoutData {
  event: any;
  selectedSeats: any[];
  ticketTiers: any[];
  addOns: any[];
  customerInfo: any;
  paymentMethod: string;
  totalAmount: number;
  currency: string;
}

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
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('event');
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({
    selectedSeats: [],
    ticketTiers: [],
    addOns: [],
    totalAmount: 0,
    currency: 'USD'
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100;

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'event':
        return !!checkoutData.event;
      case 'seats':
        return checkoutData.selectedSeats && checkoutData.selectedSeats.length > 0;
      case 'tiers':
        return checkoutData.ticketTiers && checkoutData.ticketTiers.length > 0;
      case 'addons':
        return true; // Add-ons are optional
      case 'customer':
        return !!checkoutData.customerInfo?.email && !!checkoutData.customerInfo?.firstName;
      case 'payment':
        return !!checkoutData.paymentMethod;
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'event':
        return (
          <EventSelection
            onEventSelect={(event) => updateCheckoutData({ event })}
            selectedEvent={checkoutData.event}
          />
        );
      case 'seats':
        return (
          <SeatSelection
            event={checkoutData.event}
            selectedSeats={checkoutData.selectedSeats || []}
            onSeatsChange={(seats) => updateCheckoutData({ selectedSeats: seats })}
          />
        );
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
            onConfirmOrder={() => setCurrentStep('confirmation')}
          />
        );
      case 'confirmation':
        return (
          <TicketConfirmation
            checkoutData={checkoutData}
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
            {currentStep !== 'event' && (
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
          <Badge variant="secondary">
            {currentStepIndex + 1}/{STEPS.length}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {renderStepContent()}
      </div>

      {/* Mobile Footer Navigation */}
      {currentStep !== 'confirmation' && (
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
                {currentStep !== 'event' && currentStep !== 'confirmation' && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed() || isLoading}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
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