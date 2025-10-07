import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Ticket } from 'lucide-react';

interface TicketTiersProps {
  event: any;
  selectedSeats: any[];
  selectedTiers: any[];
  onTiersChange: (tiers: any[]) => void;
}

export const TicketTiers: React.FC<TicketTiersProps> = ({
  event,
  selectedSeats,
  selectedTiers,
  onTiersChange
}) => {
  // Get ticket types from event
  const ticketTypes = event?.ticket_types?.filter((tt: any) => tt.is_active) || [];

  const handleTierSelect = (tier: any) => {
    const existingIndex = selectedTiers.findIndex(t => t.id === tier.id);
    
    if (existingIndex >= 0) {
      // Remove tier
      const updated = selectedTiers.filter(t => t.id !== tier.id);
      onTiersChange(updated);
    } else {
      // Add tier
      onTiersChange([...selectedTiers, { 
        id: tier.id,
        name: tier.name,
        description: tier.description,
        price: tier.base_price,
        currency: tier.currency,
        quantity: 1,
        max_quantity: tier.max_quantity
      }]);
    }
  };

  const updateQuantity = (tierId: string, quantity: number) => {
    const updated = selectedTiers.map(tier => 
      tier.id === tierId ? { ...tier, quantity } : tier
    );
    onTiersChange(updated);
  };

  const getSelectedTier = (tierId: string) => {
    return selectedTiers.find(t => t.id === tierId);
  };

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No ticket types available for this event</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose Your Ticket</h2>
        <p className="text-muted-foreground">Select the ticket type for this event</p>
      </div>

      {ticketTypes.map((tier: any) => {
        const selectedTier = getSelectedTier(tier.id);
        const isSelected = !!selectedTier;

        return (
          <Card 
            key={tier.id} 
            className={`relative transition-all duration-200 cursor-pointer hover:shadow-lg ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => handleTierSelect(tier)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description || 'Event ticket'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {tier.currency === 'USD' ? '$' : tier.currency === 'ZWL' ? 'Z$' : 'RTGS$'}
                    {tier.base_price}
                  </div>
                  <div className="text-xs text-muted-foreground">per ticket</div>
                </div>
              </div>

              {/* Quantity Selector */}
              {isSelected && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(tier.id, Math.max(1, selectedTier.quantity - 1));
                      }}
                      disabled={selectedTier.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="font-medium w-8 text-center">{selectedTier.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const maxQty = tier.max_quantity || 10;
                        updateQuantity(tier.id, Math.min(maxQty, selectedTier.quantity + 1));
                      }}
                      disabled={selectedTier.quantity >= (tier.max_quantity || 10)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      {selectedTiers.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Your Selection</h3>
            <div className="space-y-2">
              {selectedTiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between">
                  <span className="text-sm">{tier.name} × {tier.quantity}</span>
                  <span className="font-semibold">${(tier.price * tier.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>
                  ${selectedTiers.reduce((sum, tier) => sum + (tier.price * tier.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};