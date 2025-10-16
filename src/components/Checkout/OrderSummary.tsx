import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, CreditCard, Receipt } from 'lucide-react';

interface OrderSummaryProps {
  checkoutData: any;
  onConfirmOrder: () => void;
  isProcessing?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  checkoutData, 
  onConfirmOrder, 
  isProcessing = false 
}) => {
  const formatCurrency = (amount: number) => {
    const symbol = checkoutData.currency === 'USD' ? '$' : 
                   checkoutData.currency === 'ZWL' ? 'Z$' : 'RTGS$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateFees = () => {
    if (checkoutData.paymentMethod === 'visa') {
      return (checkoutData.totalAmount || 0) * 0.029; // 2.9% fee
    }
    return 0;
  };

  const fees = calculateFees();
  const subtotalWithFees = (checkoutData.totalAmount || 0) + fees;
  const serviceFee = subtotalWithFees * 0.05; // 5% service fee on amount after processing fees
  const finalTotal = subtotalWithFees + serviceFee;

  return (
    <div className="space-y-6">
      {/* Event Details */}
      {checkoutData.event && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{checkoutData.event.title}</h3>
              {checkoutData.event.venue && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {typeof checkoutData.event.venue === 'string' 
                    ? checkoutData.event.venue 
                    : `${checkoutData.event.venue.name || ''}, ${checkoutData.event.venue.city || ''}`}
                </div>
              )}
              {checkoutData.event.date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(checkoutData.event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets */}
      {checkoutData.ticketTiers && checkoutData.ticketTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkoutData.ticketTiers.map((tier: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-semibold">{tier.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {tier.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(tier.price * tier.quantity)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(tier.price)} each
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      {checkoutData.customerInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {checkoutData.customerInfo.firstName} {checkoutData.customerInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{checkoutData.customerInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{checkoutData.customerInfo.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {checkoutData.customerInfo.city}, {checkoutData.customerInfo.country}
                </p>
              </div>
            </div>
            {checkoutData.customerInfo.specialRequests && (
              <div>
                <p className="text-sm text-muted-foreground">Special Requests</p>
                <p className="text-sm mt-1">{checkoutData.customerInfo.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      {checkoutData.paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {checkoutData.paymentMethod.replace('-', ' ')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Payment will be processed securely
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Total */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(checkoutData.totalAmount || 0)}</span>
          </div>
          
          {fees > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing Fee (2.9%)</span>
              <span>{formatCurrency(fees)}</span>
            </div>
          )}
          
          {serviceFee > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service Fee (5%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
          
          <Button 
            onClick={onConfirmOrder} 
            className="w-full mt-6" 
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing Order...
              </>
            ) : (
              'Confirm & Pay'
            )}
          </Button>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            By confirming, you agree to our terms of service and privacy policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};