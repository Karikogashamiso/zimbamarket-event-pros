import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const BusinessListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBusinessDetails();
      fetchServices();
    }
  }, [id, user]);

  const fetchBusinessDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('business_listings')
        .select(`
          *,
          category:categories(name, icon)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Check if user owns this business
      if (user && data.user_id !== user.id) {
        toast.error('You do not have access to this business');
        navigate('/service-provider');
        return;
      }

      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business details');
      navigate('/service-provider');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_listing_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteServiceId);

      if (error) throw error;

      toast.success('Service deleted successfully');
      setServices(prev => prev.filter(s => s.id !== deleteServiceId));
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setDeleteServiceId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Business not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{business.business_name} | ZimEventPro</title>
      </Helmet>

      <div className="h-20"></div>

      {/* Hero Header */}
      <section className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/service-provider')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{business.business_name}</h1>
                <Badge variant={business.status === 'approved' ? 'default' : 'secondary'}>
                  {business.status}
                </Badge>
                {business.featured && (
                  <Badge variant="secondary" className="bg-yellow-500">Featured</Badge>
                )}
              </div>
              <p className="text-xl text-white/90 mb-4">{business.description}</p>
              <div className="flex flex-wrap gap-4 text-white/80">
                {business.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {business.location}
                  </div>
                )}
                {business.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {business.phone_number}
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {business.email}
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate(`/list-business?edit=${business.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Business
            </Button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
              <TabsTrigger value="details">Business Details</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Services</h2>
                  <p className="text-muted-foreground">Manage services offered by this business</p>
                </div>
                {business.status === 'approved' && (
                  <Button onClick={() => navigate('/service-provider/create-service')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                )}
              </div>

              {services.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Start adding services to showcase what your business offers
                    </p>
                    {business.status === 'approved' && (
                      <Button onClick={() => navigate('/service-provider/create-service')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Service
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
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
                              <Badge variant="secondary" className="bg-yellow-500">Featured</Badge>
                            )}
                            {service.is_verified && (
                              <Badge variant="secondary" className="bg-blue-500">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
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
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link to={`/service/${service.id}`}>
                              View Details
                            </Link>
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
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                      <p className="text-lg">{business.business_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <p className="text-lg">{business.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={business.status === 'approved' ? 'default' : 'secondary'}>
                        {business.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <p className="text-lg">{business.location}</p>
                    </div>
                    {business.address && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-lg">{business.address}</p>
                      </div>
                    )}
                    {business.description && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="text-base">{business.description}</p>
                      </div>
                    )}
                    {business.amenities && business.amenities.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Amenities</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {business.amenities.map((amenity: string, index: number) => (
                            <Badge key={index} variant="outline">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {business.images && business.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {business.images.map((image: string, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Business ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

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
    </div>
  );
};

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>{children}</label>
);

export default BusinessListingDetail;
