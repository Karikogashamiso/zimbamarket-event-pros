import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface AddEventAddonFormProps {
  eventId: string;
  onAddonAdded: () => void;
}

export const AddEventAddonForm: React.FC<AddEventAddonFormProps> = ({ eventId, onAddonAdded }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    category: 'experience',
    max_quantity: '10'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('event_addons')
        .insert({
          event_id: eventId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency as any,
          category: formData.category,
          max_quantity: parseInt(formData.max_quantity),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Add-on created successfully",
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        category: 'experience',
        max_quantity: '10'
      });
      setIsOpen(false);
      onAddonAdded();
    } catch (error: any) {
      console.error('Error creating add-on:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create add-on",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Event Add-On
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Add New Event Add-On</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Add-On Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VIP Parking, Meal Package, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="ZWL">ZWL (Z$)</SelectItem>
                  <SelectItem value="RTGS">RTGS (RTGS$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dining">Food & Beverages</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="comfort">Comfort & Convenience</SelectItem>
                  <SelectItem value="experience">Premium Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_quantity">Max Quantity</Label>
              <Input
                id="max_quantity"
                type="number"
                min="1"
                value={formData.max_quantity}
                onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Add-On'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};