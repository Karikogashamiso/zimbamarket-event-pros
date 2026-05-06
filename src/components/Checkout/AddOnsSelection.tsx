import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Utensils, Car, Luggage, Wifi, Coffee, Gift, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  max_quantity: number;
  is_active: boolean;
}

interface AddOnsSelectionProps {
  event: { id?: string; [key: string]: unknown };
  selectedAddOns: AddOn[];
  onAddOnsChange: (addOns: AddOn[]) => void;
}

export const AddOnsSelection: React.FC<AddOnsSelectionProps> = ({
  event,
  selectedAddOns,
  onAddOnsChange
}) => {
  const { toast } = useToast();
  const [addOns, setAddOns] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddOns = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('event_addons')
          .select('*')
          .eq('event_id', event?.id)
          .eq('is_active', true);

        if (error) throw error;
        setAddOns(data || []);
      } catch (error: unknown) {
        console.error('Error fetching add-ons:', error);
        toast({
          title: "Error",
          description: "Failed to load add-ons",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (event?.id) {
      fetchAddOns();
    } else {
      setLoading(false);
    }
  }, [event?.id, toast]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'dining': return <Utensils className="h-5 w-5" />;
      case 'transport': return <Car className="h-5 w-5" />;
      case 'comfort': return <Wifi className="h-5 w-5" />;
      case 'experience': return <Gift className="h-5 w-5" />;
      default: return <Ticket className="h-5 w-5" />;
    }
  };
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

  const groupedAddOns = addOns.reduce((groups, addOn) => {
    if (!groups[addOn.category]) {
      groups[addOn.category] = [];
    }
    groups[addOn.category].push(addOn);
    return groups;
  }, {} as Record<string, any[]>);

  const totalAddOnsPrice = selectedAddOns.reduce((sum, addOn) => {
    return sum + (addOn.price * addOn.quantity);
  }, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading add-ons...</p>
        </CardContent>
      </Card>
    );
  }

  if (addOns.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No add-ons available for this event
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Enhance Your Experience</h2>
        <p className="text-muted-foreground">Add optional extras to make your event even better</p>
      </div>

      {Object.entries(groupedAddOns).map(([category, categoryAddOns]: [string, any[]]) => (
        <div key={category}>
          <h3 className="font-semibold text-lg mb-3">{getCategoryTitle(category)}</h3>
          <div className="space-y-3">
            {categoryAddOns.map((addOn: AddOn) => {
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
                        {getIcon(addOn.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {addOn.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{addOn.description || 'Event add-on'}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold">
                              {addOn.currency === 'USD' ? '$' : addOn.currency === 'ZWL' ? 'Z$' : 'RTGS$'}
                              {addOn.price}
                            </div>
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
                                  const maxQty = addOn.max_quantity || 10;
                                  updateQuantity(addOn.id, Math.min(maxQty, selectedAddOn.quantity + 1));
                                }}
                                disabled={selectedAddOn.quantity >= (addOn.max_quantity || 10)}
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

    </div>
  );
};