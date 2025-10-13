import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Heart, 
  Star, 
  ArrowRight, 
  Sparkles,
  Users,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import LazyImage from '@/components/LazyImage';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  description: string;
  location: string;
  price_from?: number;
  rating: number;
  category?: { name: string };
  image_url?: string;
}

interface SmartRecommendationsProps {
  className?: string;
  maxItems?: number;
  showTrending?: boolean;
  showPersonalized?: boolean;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  className,
  maxItems = 8,
  showTrending = true,
  showPersonalized = true
}) => {
  const { user } = useAuth();
  const {
    recommendations,
    isLoading,
    getTrendingServices,
    generateRecommendations
  } = useSmartRecommendations(user?.id);

  const [trendingServices, setTrendingServices] = useState<Service[]>([]);
  const [personalizedServices, setPersonalizedServices] = useState<Service[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Load trending services
  useEffect(() => {
    if (showTrending) {
      setLoadingTrending(true);
      getTrendingServices().then(services => {
        // Add missing properties to match Service interface
        const formattedServices = services.map(service => ({
          ...service,
          description: `Popular ${service.category?.name || 'service'} with excellent ratings`,
          location: 'Harare, Zimbabwe'
        }));
        setTrendingServices(formattedServices);
        setLoadingTrending(false);
      });
    }
  }, [showTrending]);

  // Load personalized recommendations
  useEffect(() => {
    if (recommendations.length > 0) {
      // Mock service data based on recommendations
      const mockServices = recommendations.slice(0, maxItems).map((rec, index) => ({
        id: rec.serviceId,
        title: `Recommended Service ${index + 1}`,
        description: `${rec.reasons.join(', ')}. Perfect match for your preferences.`,
        location: 'Harare, Zimbabwe',
        price_from: 150 + (index * 50),
        rating: 4.5 + (Math.random() * 0.5),
        category: { name: 'Event Service' },
        image_url: `/api/placeholder/300/200?random=${index}`
      }));
      
      setPersonalizedServices(mockServices);
    }
  }, [recommendations, maxItems]);

  const handleRefreshRecommendations = () => {
    generateRecommendations();
  };

  const ServiceCard: React.FC<{ 
    service: Service; 
    reason?: string; 
    isPersonalized?: boolean 
  }> = ({ service, reason, isPersonalized = false }) => (
    <Card className="group overflow-hidden border-0 shadow-elegant hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3]">
        <LazyImage
          src={service.image_url || "/placeholder.svg"}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          placeholder="/placeholder.svg"
        />
        
        <div className="absolute top-3 left-3">
          {isPersonalized ? (
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              For You
            </Badge>
          ) : (
            <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-lg">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/95 hover:bg-white text-muted-foreground hover:text-red-500 shadow-lg backdrop-blur-sm"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
            {service.category?.name}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">{service.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <h3 className="font-display font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {service.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {reason || service.description}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">{service.location}</span>
          {service.price_from && (
            <span className="text-base font-bold text-primary">
              ${service.price_from}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-elegant">
          <div className="w-full aspect-[4/3] bg-muted animate-pulse"></div>
          <CardContent className="p-5 space-y-3">
            <div className="w-20 h-5 bg-muted rounded animate-pulse"></div>
            <div className="w-full h-5 bg-muted rounded animate-pulse"></div>
            <div className="w-4/5 h-4 bg-muted rounded animate-pulse"></div>
            <div className="w-3/5 h-4 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <section className={cn("py-16 bg-gradient-to-b from-background to-muted/20", className)}>
      <div className="container mx-auto px-4 space-y-16">
        {/* Personalized Recommendations */}
        {showPersonalized && user && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3 mb-2">
                  <Sparkles className="w-7 h-7 text-purple-600" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Recommended for You
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Curated based on your preferences and activity
                </p>
              </div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefreshRecommendations}
                disabled={isLoading}
                className="hover-scale"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : personalizedServices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {personalizedServices.slice(0, 4).map((service, index) => {
                    const recommendation = recommendations.find(r => r.serviceId === service.id);
                    return (
                      <Link 
                        key={service.id} 
                        to={`/service/${service.id}`}
                        style={{
                          animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <ServiceCard
                          service={service}
                          reason={recommendation?.reasons.join(', ')}
                          isPersonalized={true}
                        />
                      </Link>
                    );
                  })}
                </div>
                
                {personalizedServices.length > 4 && (
                  <div className="text-center">
                    <Link to="/recommendations">
                      <Button variant="outline" size="lg" className="hover-scale group">
                        View All Recommendations
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center border-0 shadow-elegant">
                <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Building Your Recommendations</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Browse and search for services to get personalized recommendations
                </p>
                <Link to="/search">
                  <Button size="lg" className="hover-scale">
                    <Eye className="w-4 h-4 mr-2" />
                    Explore Services
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* Trending Services */}
        {showTrending && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3 mb-2">
                  <TrendingUp className="w-7 h-7 text-orange-600" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                    Trending This Week
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Most popular services among our users
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
                <Users className="w-4 h-4" />
                <span>Updated hourly</span>
              </div>
            </div>

            {loadingTrending ? (
              <LoadingSkeleton />
            ) : trendingServices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {trendingServices.slice(0, 4).map((service, index) => (
                    <Link 
                      key={service.id} 
                      to={`/service/${service.id}`}
                      style={{
                        animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <ServiceCard service={service} />
                    </Link>
                  ))}
                </div>
                
                {trendingServices.length > 4 && (
                  <div className="text-center">
                    <Link to="/trending">
                      <Button variant="outline" size="lg" className="hover-scale group">
                        View All Trending
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center border-0 shadow-elegant">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">No Trending Data Yet</h3>
                <p className="text-muted-foreground">
                  Check back later for trending services
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartRecommendations;