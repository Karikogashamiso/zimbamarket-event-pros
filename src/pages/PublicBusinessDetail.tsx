import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import LazyImage from '@/components/LazyImage';

const PublicBusinessDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchBusinessDetails();
      fetchServices();
    }
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('business_listings')
        .select(`
          *,
          category:categories(name, icon)
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Business not found');
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
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
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
            <Link to="/" className="text-primary hover:underline mt-4 inline-block">
              Return to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{business.business_name} | ZimEventPro</title>
        <meta name="description" content={business.description} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <LazyImage
          src={business.images[0] || '/placeholder.svg'}
          alt={business.business_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mb-4 text-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">{business.business_name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Badge variant="secondary" className="text-sm">
              {business.category?.name}
            </Badge>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{business.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{business.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {business.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>Choose from our range of services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        to={`/service/${service.id}`}
                        className="block group"
                      >
                        <Card className="transition-shadow hover:shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <LazyImage
                                src={service.images[0] || '/placeholder.svg'}
                                alt={service.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                  {service.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {service.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  {service.price_from && (
                                    <span className="text-primary font-medium">
                                      From ${service.price_from} {service.price_unit}
                                    </span>
                                  )}
                                  {service.capacity_max && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <Users className="w-4 h-4" />
                                      Up to {service.capacity_max}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a href={`tel:${business.phone_number}`} className="text-sm text-primary hover:underline">
                        {business.phone_number}
                      </a>
                    </div>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a href={`mailto:${business.email}`} className="text-sm text-primary hover:underline">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{business.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capacity */}
            {(business.capacity_min || business.capacity_max) && (
              <Card>
                <CardHeader>
                  <CardTitle>Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>
                      {business.capacity_min && business.capacity_max
                        ? `${business.capacity_min} - ${business.capacity_max} guests`
                        : business.capacity_max
                        ? `Up to ${business.capacity_max} guests`
                        : `From ${business.capacity_min} guests`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            {business.price_from && (
              <Card>
                <CardHeader>
                  <CardTitle>Starting Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${business.price_from}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {business.price_unit}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBusinessDetail;
