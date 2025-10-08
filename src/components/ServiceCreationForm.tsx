import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const ServiceCreationForm = () => {
  const { user } = useAuth();
  const { services, createService, deleteService, loading } = useServiceManagement();
  const [businessListings, setBusinessListings] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    price_from: '',
    price_unit: 'service',
    capacity_min: '',
    capacity_max: '',
    amenities: ''
  });

  useEffect(() => {
    fetchBusinessListings();
  }, [user]);

  const fetchBusinessListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;
      setBusinessListings(data || []);
    } catch (error) {
      console.error('Error fetching business listings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      alert('Please select a business listing');
      return;
    }

    const amenitiesArray = formData.amenities
      ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

    const serviceData = {
      category_id: selectedCategoryId,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      address: formData.address || undefined,
      price_from: formData.price_from ? parseFloat(formData.price_from) : undefined,
      price_unit: formData.price_unit,
      capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : undefined,
      capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : undefined,
      amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined
    };

    const result = await createService(serviceData);
    
    if (result) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        address: '',
        price_from: '',
        price_unit: 'service',
        capacity_min: '',
        capacity_max: '',
        amenities: ''
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (businessListings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No approved business listings found. Please submit a business application first.
            </p>
            <Button onClick={() => window.location.href = '/list-business'}>
              Submit Business Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Business Listing *</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {businessListings.map((listing) => (
                    <SelectItem key={listing.id} value={listing.category_id}>
                      {listing.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Service Name *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Premium Wedding Package"
                required
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service in detail..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price From</Label>
                <Input
                  type="number"
                  value={formData.price_from}
                  onChange={(e) => handleInputChange('price_from', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Price Unit</Label>
                <Select value={formData.price_unit} onValueChange={(val) => handleInputChange('price_unit', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Per Service</SelectItem>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="person">Per Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity_min}
                  onChange={(e) => handleInputChange('capacity_min', e.target.value)}
                  placeholder="Minimum guests/people"
                />
              </div>
              <div>
                <Label>Max Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity_max}
                  onChange={(e) => handleInputChange('capacity_max', e.target.value)}
                  placeholder="Maximum guests/people"
                />
              </div>
            </div>

            <div>
              <Label>Amenities (comma-separated)</Label>
              <Input
                value={formData.amenities}
                onChange={(e) => handleInputChange('amenities', e.target.value)}
                placeholder="e.g., Parking, WiFi, Catering, Sound System"
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Loading...</p>
          ) : services.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No services yet</p>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-start justify-between border rounded-lg p-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{service.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{service.location}</Badge>
                      {service.price_from && (
                        <Badge variant="secondary">${service.price_from}</Badge>
                      )}
                      {service.active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
