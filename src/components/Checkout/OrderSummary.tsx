import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  checkoutData: any;
  onConfirmOrder: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ checkoutData, onConfirmOrder }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Event: {checkoutData.event?.title}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${checkoutData.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
          <Button onClick={onConfirmOrder} className="w-full mt-4">
            Confirm Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};