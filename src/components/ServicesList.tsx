import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MapPin, Edit, Trash2, Star, BadgeCheck, Package } from 'lucide-react';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ServicesList = () => {
  const navigate = useNavigate();
  const { services, loading, deleteService } = useServiceManagement(undefined, true);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    
    await deleteService(deleteServiceId);
    setDeleteServiceId(null);
  };

  const handleToggleFeatured = async (serviceId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ featured: !currentFeatured })
        .eq('id', serviceId);

      if (error) throw error;

      toast.success(`Service ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      
      // Refresh the list
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error toggling featured:', error);
      toast.error(error.message || "Failed to update featured status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
        <p className="text-muted-foreground text-center mb-6">
          Start adding services to showcase what your business offers
        </p>
        <Button onClick={() => navigate('/service-provider/create-service')}>
          Create Your First Service
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            {service.images && service.images.length > 0 && (
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{service.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {service.description}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {service.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-500">
                      <Star className="w-3 h-3" />
                    </Badge>
                  )}
                  {service.is_verified && (
                    <Badge variant="secondary" className="bg-blue-500">
                      <BadgeCheck className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                {service.price_from && (
                  <p className="font-semibold text-primary">
                    From ${service.price_from}/{service.price_unit || 'service'}
                  </p>
                )}
                {service.location && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </p>
                )}
                {service.capacity_max && (
                  <p className="text-muted-foreground">
                    Capacity: {service.capacity_min || 0} - {service.capacity_max} people
                  </p>
                )}
                <Badge variant={service.active ? 'default' : 'secondary'}>
                  {service.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {/* Featured Toggle */}
              <div className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-lg mb-4">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Show on home page</span>
                <Switch
                  checked={service.is_featured || false}
                  onCheckedChange={() => handleToggleFeatured(service.id, service.is_featured || false)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/service-provider/create-service?edit=${service.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteServiceId(service.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
