import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Upload, X, Star, BadgeCheck, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ServiceCreationForm = () => {
  const { user } = useAuth();
  const { services, createService, updateService, deleteService, loading } = useServiceManagement(undefined, true);
  const [businessListings, setBusinessListings] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
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

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `services/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
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
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setSelectedCategoryId(service.category_id);
    setFormData({
      title: service.title,
      description: service.description,
      location: service.location,
      address: service.address || '',
      price_from: service.price_from?.toString() || '',
      price_unit: service.price_unit || 'service',
      capacity_min: service.capacity_min?.toString() || '',
      capacity_max: service.capacity_max?.toString() || '',
      amenities: service.amenities?.join(', ') || '',
      is_featured: service.is_featured || false,
      is_verified: service.is_verified || false
    });
    setExistingImages(service.images || []);
    setImageFiles([]);
    setImagePreviewUrls([]);
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setFormData({
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
    setImageFiles([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      toast.error('Please select a business listing');
      return;
    }

    // Upload new images
    const newImageUrls = await uploadImages();
    
    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];

    // Find the selected business listing to get its ID
    const selectedBusinessListing = businessListings.find(
      bl => bl.category_id === selectedCategoryId
    );

    const amenitiesArray = formData.amenities
      ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

    const serviceData = {
      category_id: selectedCategoryId,
      business_listing_id: selectedBusinessListing?.id,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      address: formData.address || undefined,
      price_from: formData.price_from ? parseFloat(formData.price_from) : undefined,
      price_unit: formData.price_unit,
      capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : undefined,
      capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : undefined,
      amenities: amenitiesArray.length > 0 ? amenitiesArray : undefined,
      images: allImages.length > 0 ? allImages : undefined,
      is_featured: formData.is_featured,
      is_verified: formData.is_verified
    };

    let result;
    if (editingService) {
      result = await updateService(editingService.id, serviceData);
      if (result) {
        toast.success('Service updated successfully!');
        handleCancelEdit();
      }
    } else {
      result = await createService(serviceData);
      if (result) {
        toast.success('Service created successfully!');
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
          amenities: '',
          is_featured: false,
          is_verified: false
        });
        setImageFiles([]);
        setImagePreviewUrls([]);
        setExistingImages([]);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'is_featured' || field === 'is_verified') {
      setFormData(prev => ({ ...prev, [field]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
          <CardTitle>
            {editingService ? 'Edit Service' : 'Add New Service'}
          </CardTitle>
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

            {/* Image Upload */}
            <div>
              <Label>Service Images (Max 5)</Label>
              <div className="mt-2">
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
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images ({imageFiles.length}/5)
                    </p>
                  </div>
                </label>
              </div>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Existing Images</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">New Images</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Featured and Verified Toggles */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <Label htmlFor="is_featured" className="cursor-pointer">Mark as Featured</Label>
                    <p className="text-xs text-muted-foreground">Featured services appear at the top</p>
                  </div>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked.toString())}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  <div>
                    <Label htmlFor="is_verified" className="cursor-pointer">Mark as Verified</Label>
                    <p className="text-xs text-muted-foreground">Verified badge builds trust</p>
                  </div>
                </div>
                <Switch
                  id="is_verified"
                  checked={formData.is_verified}
                  onCheckedChange={(checked) => handleInputChange('is_verified', checked.toString())}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {editingService && (
                <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={uploadingImages}>
                <Plus className="w-4 h-4 mr-2" />
                {uploadingImages ? 'Uploading...' : editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
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
                <div key={service.id} className="flex items-start gap-4 border rounded-lg p-4">
                  {/* Service Image */}
                  {service.images && service.images.length > 0 && (
                    <div className="flex-shrink-0">
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <h4 className="font-medium">{service.title}</h4>
                      {service.is_featured && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {service.is_verified && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{service.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline">{service.location}</Badge>
                      {service.price_from && (
                        <Badge variant="secondary">${service.price_from}</Badge>
                      )}
                      {service.active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      {service.images && service.images.length > 0 && (
                        <Badge variant="outline">{service.images.length} image{service.images.length > 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteServiceId(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this service. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteServiceId) {
                  deleteService(deleteServiceId);
                  setDeleteServiceId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
