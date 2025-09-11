import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Utensils, Car, Luggage, Wifi, Coffee, Gift } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: 'dining' | 'transport' | 'comfort' | 'experience';
  icon: React.ReactNode;
  popular?: boolean;
}

const ADD_ONS: AddOn[] = [
  {
    id: 'vip-table',
    name: 'VIP Table Reservation',
    description: 'Reserved table with premium location and bottle service',
    price: 150,
    currency: 'USD',
    category: 'experience',
    icon: <Gift className="h-5 w-5" />,
    popular: true
  },
  {
    id: 'meal-package',
    name: 'Gourmet Meal Package',
    description: 'Three-course meal with complimentary drinks',
    price: 35,
    currency: 'USD',
    category: 'dining',
    icon: <Utensils className="h-5 w-5" />
  },
  {
    id: 'vip-parking',
    name: 'VIP Parking',
    description: 'Priority parking close to venue entrance',
    price: 20,
    currency: 'USD',
    category: 'transport',
    icon: <Car className="h-5 w-5" />
  },
  {
    id: 'extra-luggage',
    name: 'Extra Luggage (Transport)',
    description: 'Additional 20kg luggage allowance for transport tickets',
    price: 15,
    currency: 'USD',
    category: 'transport',
    icon: <Luggage className="h-5 w-5" />
  },
  {
    id: 'wifi-access',
    name: 'Premium WiFi',
    description: 'High-speed internet access throughout the event',
    price: 10,
    currency: 'USD',
    category: 'comfort',
    icon: <Wifi className="h-5 w-5" />
  },
  {
    id: 'refreshments',
    name: 'Refreshment Package',
    description: 'Unlimited soft drinks and snacks',
    price: 25,
    currency: 'USD',
    category: 'dining',
    icon: <Coffee className="h-5 w-5" />
  }
];

interface AddOnsSelectionProps {
  event: any;
  selectedAddOns: any[];
  onAddOnsChange: (addOns: any[]) => void;
}

export const AddOnsSelection: React.FC<AddOnsSelectionProps> = ({
  event,
  selectedAddOns,
  onAddOnsChange
}) => {
  const toggleAddOn = (addOn: AddOn) => {
    const existingIndex = selectedAddOns.findIndex(a => a.id === addOn.id);
    
    if (existingIndex >= 0) {
      // Remove add-on
      const updated = selectedAddOns.filter(a => a.id !== addOn.id);
      onAddOnsChange(updated);
    } else {
      // Add add-on
      onAddOnsChange([...selectedAddOns, { ...addOn, quantity: 1 }]);
    }
  };

  const updateQuantity = (addOnId: string, quantity: number) => {
    const updated = selectedAddOns.map(addOn => 
      addOn.id === addOnId ? { ...addOn, quantity } : addOn
    );
    onAddOnsChange(updated);
  };

  const getSelectedAddOn = (addOnId: string) => {
    return selectedAddOns.find(a => a.id === addOnId);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'dining': return 'Food & Beverages';
      case 'transport': return 'Transport Options';
      case 'comfort': return 'Comfort & Convenience';
      case 'experience': return 'Premium Experiences';
      default: return 'Add-Ons';
    }
  };

  const groupedAddOns = ADD_ONS.reduce((groups, addOn) => {
    if (!groups[addOn.category]) {
      groups[addOn.category] = [];
    }
    groups[addOn.category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  const totalAddOnsPrice = selectedAddOns.reduce((sum, addOn) => {
    return sum + (addOn.price * addOn.quantity);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Enhance Your Experience</h2>
        <p className="text-muted-foreground">Add optional extras to make your event even better</p>
      </div>

      {Object.entries(groupedAddOns).map(([category, addOns]) => (
        <div key={category}>
          <h3 className="font-semibold text-lg mb-3">{getCategoryTitle(category)}</h3>
          <div className="space-y-3">
            {addOns.map((addOn) => {
              const selectedAddOn = getSelectedAddOn(addOn.id);
              const isSelected = !!selectedAddOn;

              return (
                <Card 
                  key={addOn.id}
                  className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => toggleAddOn(addOn)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-accent/20 text-accent-foreground flex-shrink-0">
                        {addOn.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {addOn.name}
                              {addOn.popular && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">{addOn.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold">${addOn.price}</div>
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        {isSelected && (
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(addOn.id, Math.max(1, selectedAddOn.quantity - 1));
                                }}
                                disabled={selectedAddOn.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="font-medium w-8 text-center">
                                {selectedAddOn.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(addOn.id, Math.min(10, selectedAddOn.quantity + 1));
                                }}
                                disabled={selectedAddOn.quantity >= 10}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Add-Ons Summary */}
      {selectedAddOns.length > 0 && (
        <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selected Add-Ons</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {selectedAddOns.map((addOn) => (
                <div key={addOn.id} className="flex items-center justify-between">
                  <span className="text-sm">{addOn.name} × {addOn.quantity}</span>
                  <span className="font-medium">${(addOn.price * addOn.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex items-center justify-between font-semibold">
                <span>Add-Ons Total</span>
                <span>${totalAddOnsPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedAddOns.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No add-ons selected. You can continue without any extras or choose from the options above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};