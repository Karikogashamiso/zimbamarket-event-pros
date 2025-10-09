import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, DollarSign, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

interface SavedService {
  id: string;
  title: string;
  description: string;
  category?: {
    name: string;
    icon: string;
  };
  location: string;
  price_from: number;
  price_unit: string;
  rating: number;
  review_count: number;
  images: string[];
  is_verified: boolean;
  is_featured: boolean;
}

const Favorites = () => {
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedServices();
  }, []);

  const fetchSavedServices = async () => {
    try {
      setLoading(true);
      const savedIds = localStorage.getItem('savedServices');
      
      if (!savedIds) {
        setSavedServices([]);
        return;
      }

      const ids = JSON.parse(savedIds);
      
      if (ids.length === 0) {
        setSavedServices([]);
        return;
      }

      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          category:categories(name, icon),
          location,
          price_from,
          price_unit,
          rating,
          review_count,
          images,
          is_verified,
          is_featured
        `)
        .in('id', ids)
        .eq('active', true);

      if (error) throw error;

      setSavedServices(data || []);
    } catch (error) {
      console.error('Error fetching saved services:', error);
      toast({
        title: "Error",
        description: "Failed to load your favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (serviceId: string) => {
    const savedIds = localStorage.getItem('savedServices');
    if (!savedIds) return;

    const ids = JSON.parse(savedIds);
    const updatedIds = ids.filter((id: string) => id !== serviceId);
    localStorage.setItem('savedServices', JSON.stringify(updatedIds));

    setSavedServices(prev => prev.filter(s => s.id !== serviceId));
    
    toast({
      title: "Removed from favorites",
      description: "Service has been removed from your favorites.",
    });
  };

  const getServiceImage = (service: SavedService) => {
    if (service.images && service.images.length > 0) {
      return service.images[0];
    }
    return "/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your favorites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Favorites | ZimEventPro</title>
        <meta name="description" content="View and manage your favorite event services" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="h-20"></div>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="text-4xl font-bold">My Favorites</h1>
            </div>

            {savedServices.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start saving services you love to find them easily later
                </p>
                <Link to="/search">
                  <Button>Browse Services</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden hover-lift">
                    <div className="relative h-48">
                      <img
                        src={getServiceImage(service)}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => handleRemoveFavorite(service.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      {service.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-secondary">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <Badge variant="outline" className="mb-2">
                          {service.category?.name}
                        </Badge>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{service.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{service.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-muted-foreground">
                            ({service.review_count || 0} reviews)
                          </span>
                        </div>

                        {service.price_from && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-primary">
                              From ${service.price_from}
                              {service.price_unit && `/${service.price_unit}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link to={`/service/${service.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Favorites;
