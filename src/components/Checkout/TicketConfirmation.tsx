import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface TicketConfirmationProps {
  checkoutData: any;
}

export const TicketConfirmation: React.FC<TicketConfirmationProps> = ({ checkoutData }) => {
  return (
    <div className="text-center space-y-6">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <Card>
        <CardHeader>
          <CardTitle>Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your tickets have been sent to {checkoutData.customerInfo?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
};