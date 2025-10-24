import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Building, DollarSign, Shield, CheckCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  processingTime: string;
  fees?: string;
  popular?: boolean;
  available: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'contipay',
    name: 'ContiPay',
    description: 'Fast and secure payment gateway',
    icon: <CreditCard className="h-5 w-5" />,
    processingTime: 'Instant',
    fees: '1.5% processing fee',
    popular: true,
    available: true
  },
  {
    id: 'ecocash',
    name: 'EcoCash',
    description: 'Pay with your EcoCash wallet - Most popular in Zimbabwe',
    icon: <Smartphone className="h-5 w-5" />,
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: false
  },
  {
    id: 'onemoney',
    name: 'OneMoney',
    description: 'Pay using your OneMoney wallet',
    icon: <Smartphone className="h-5 w-5" />,
    processingTime: 'Instant',
    fees: 'No additional fees',
    available: false
  },
  {
    id: 'card',
    name: 'Visa/Mastercard',
    description: 'Pay with your international credit or debit card',
    icon: <CreditCard className="h-5 w-5" />,
    processingTime: '1-2 minutes',
    fees: '2.9% processing fee',
    available: true
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Direct transfer from your Zimbabwe bank account',
    icon: <Building className="h-5 w-5" />,
    processingTime: '2-24 hours',
    available: false
  },
  {
    id: 'cash',
    name: 'Cash Payment',
    description: 'Pay cash at authorized collection points',
    icon: <DollarSign className="h-5 w-5" />,
    processingTime: 'Manual verification',
    available: false
  }
];

interface PaymentOptionsProps {
  totalAmount: number;
  currency: string;
  selectedMethod?: string;
  onPaymentMethodChange: (method: string) => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  totalAmount,
  currency,
  selectedMethod,
  onPaymentMethodChange
}) => {
  const formatCurrency = (amount: number) => {
    const symbol = currency === 'USD' ? '$' : currency === 'ZWL' ? 'Z$' : 'RTGS$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateFees = (method: string, amount: number) => {
    switch (method) {
      case 'contipay':
        return amount * 0.015; // 1.5% fee
      case 'card':
        return amount * 0.029; // 2.9% fee
      default:
        return 0;
    }
  };

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const fees = selectedMethod ? calculateFees(selectedMethod, totalAmount) : 0;
  const finalTotal = totalAmount + fees;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Choose Payment Method</h2>
        <p className="text-muted-foreground">Select how you'd like to pay for your booking</p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const methodFees = calculateFees(method.id, totalAmount);

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => method.available && onPaymentMethodChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    method.id === 'contipay' ? 'bg-primary/10 text-primary' :
                    method.id === 'ecocash' ? 'bg-red-100 text-red-700' :
                    method.id === 'onemoney' ? 'bg-blue-100 text-blue-700' :
                    method.id === 'card' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {method.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      {method.popular && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Most Popular
                        </Badge>
                      )}
                      {!method.available && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {method.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          Processing: {method.processingTime}
                        </span>
                        {method.fees && (
                          <span className="text-muted-foreground">
                            {method.fees}
                          </span>
                        )}
                      </div>
                      
                      {methodFees > 0 && (
                        <span className="font-medium text-orange-600">
                          +{formatCurrency(methodFees)} fee
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Summary */}
      {selectedMethod && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            {fees > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Processing Fee ({selectedMethodData?.name})</span>
                <span>{formatCurrency(fees)}</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between font-semibold text-lg">
              <span>Total to Pay</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
              <Shield className="h-4 w-4" />
              <span>
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Money Instructions */}
      {selectedMethod && ['ecocash', 'onemoney'].includes(selectedMethod) && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">How to Pay with {selectedMethodData?.name}</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Click "Proceed to Payment" below</li>
              <li>2. You'll receive a payment request on your phone</li>
              <li>3. Enter your {selectedMethodData?.name} PIN to confirm</li>
              <li>4. Your tickets will be sent immediately via SMS and email</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          🔒 All payments are processed securely. We never store your payment information.
        </p>
      </div>
    </div>
  );
};