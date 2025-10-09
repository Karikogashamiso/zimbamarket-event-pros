import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Star, BadgeCheck, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet-async';

const CreateService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businessListings, setBusinessListings] = useState<any[]>([]);
  const [selectedBusinessListingId, setSelectedBusinessListingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    price_from: '',
    price_unit: 'service',
    capacity_min: '',
    capacity_max: '',
    amenities: '',
    is_featured: false,
    is_verified: false
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

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
      
      if (data && data.length === 0) {
        toast.error('No approved business listings found');
        navigate('/service-provider');
      }
    } catch (error) {
      console.error('Error fetching business listings:', error);
      toast.error('Failed to load business listings');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `services/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusinessListingId) {
      toast.error('Please select a business listing');
      return;
    }

    setSubmitting(true);

    try {
      const imageUrls = await uploadImages();
      
      const selectedBusinessListing = businessListings.find(
        bl => bl.id === selectedBusinessListingId
      );

      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      const { error } = await supabase
        .from('services')
        .insert({
          category_id: selectedBusinessListing?.category_id,
          business_listing_id: selectedBusinessListingId,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          address: formData.address || undefined,
          price_from: formData.price_from ? parseFloat(formData.price_from) : undefined,
          price_unit: formData.price_unit,
          capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : undefined,
          capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : undefined,
          amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
          is_featured: formData.is_featured,
          is_verified: formData.is_verified,
          active: true,
          rating: 0,
          review_count: 0,
          response_time: '24h',
          availability_status: 'available'
        });

      if (error) throw error;

      toast.success('Service created successfully!');
      navigate('/service-provider');
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Create Service | ZimEventPro</title>
      </Helmet>

      <div className="h-20"></div>

      {/* Hero Header */}
      <section className="bg-gradient-primary text-white py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/service-provider')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Create New Service</h1>
          <p className="text-xl text-white/90">Add a new service to your business listing</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Select which business this service belongs to</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Business Listing *</Label>
                  <Select value={selectedBusinessListingId} onValueChange={setSelectedBusinessListingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessListings.map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.business_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Provide information about your service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Service Name *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Premium Wedding Package"
                    required
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your service in detail..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Capacity</CardTitle>
                <CardDescription>Set your pricing and capacity limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Price From</Label>
                    <Input
                      type="number"
                      value={formData.price_from}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_from: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Price Unit</Label>
                    <Select value={formData.price_unit} onValueChange={(val) => setFormData(prev => ({ ...prev, price_unit: val }))}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Min Capacity</Label>
                    <Input
                      type="number"
                      value={formData.capacity_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity_min: e.target.value }))}
                      placeholder="Minimum guests/people"
                    />
                  </div>
                  <div>
                    <Label>Max Capacity</Label>
                    <Input
                      type="number"
                      value={formData.capacity_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity_max: e.target.value }))}
                      placeholder="Maximum guests/people"
                    />
                  </div>
                </div>

                <div>
                  <Label>Amenities (comma-separated)</Label>
                  <Input
                    value={formData.amenities}
                    onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                    placeholder="e.g., Parking, WiFi, Catering, Sound System"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Service Images</CardTitle>
                <CardDescription>Upload up to 5 images (max 5MB each)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="service-images"
                    disabled={imageFiles.length >= 5}
                  />
                  <label
                    htmlFor="service-images"
                    className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/50"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload images
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {imageFiles.length}/5 images selected
                      </p>
                    </div>
                  </label>
                </div>

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
                <CardDescription>Configure service visibility and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <Label htmlFor="is_featured" className="cursor-pointer font-medium">
                        Mark as Featured
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Featured services appear at the top of search results
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="is_verified" className="cursor-pointer font-medium">
                        Mark as Verified
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Verified services show a verification badge
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="is_verified"
                    checked={formData.is_verified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_verified: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/service-provider')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateService;
