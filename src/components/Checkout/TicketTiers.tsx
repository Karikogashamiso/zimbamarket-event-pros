import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Users } from 'lucide-react';

interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  benefits: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const TICKET_TIERS: TicketTier[] = [
  {
    id: 'general',
    name: 'General Admission',
    description: 'Standard entry to the event',
    price: 25,
    currency: 'USD',
    benefits: ['Event access', 'Basic seating', 'Standard entry'],
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enhanced experience with better seating',
    price: 45,
    currency: 'USD',
    benefits: ['Priority seating', 'Complimentary drink', 'Premium entrance', 'Event program'],
    popular: true,
    icon: <Star className="h-5 w-5" />
  },
  {
    id: 'vip',
    name: 'VIP Experience',
    description: 'Ultimate luxury experience',
    price: 85,
    currency: 'USD',
    benefits: ['VIP lounge access', 'Meet & greet', 'Premium bar access', 'Dedicated concierge', 'VIP parking'],
    icon: <Crown className="h-5 w-5" />
  }
];

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
  const handleTierSelect = (tier: TicketTier) => {
    const existingIndex = selectedTiers.findIndex(t => t.id === tier.id);
    
    if (existingIndex >= 0) {
      // Remove tier
      const updated = selectedTiers.filter(t => t.id !== tier.id);
      onTiersChange(updated);
    } else {
      // Add tier
      onTiersChange([...selectedTiers, { ...tier, quantity: 1 }]);
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

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose Your Experience</h2>
        <p className="text-muted-foreground">Select the ticket type that matches your preferences</p>
      </div>

      {TICKET_TIERS.map((tier) => {
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
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${tier.price}
                  </div>
                  <div className="text-xs text-muted-foreground">per person</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-4">
                {tier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
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
                        updateQuantity(tier.id, Math.min(10, selectedTier.quantity + 1));
                      }}
                      disabled={selectedTier.quantity >= 10}
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