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
    <Card className="group overflow-hidden hover-lift border-0 shadow-elegant hover:shadow-2xl transition-all duration-500">
      <div className="relative overflow-hidden">
        <LazyImage
          src={service.image_url || "/placeholder.svg"}
          alt={service.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          placeholder="/placeholder.svg"
        />
        
        <div className="absolute top-2 left-2">
          {isPersonalized ? (
            <Badge className="bg-purple-600 text-white font-semibold shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              For You
            </Badge>
          ) : (
            <Badge className="bg-orange-600 text-white font-semibold shadow-lg">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 shadow-lg"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {service.category?.name}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{service.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {reason || service.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{service.location}</span>
          {service.price_from && (
            <span className="text-sm font-semibold text-primary">
              From ${service.price_from}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="w-full h-48 bg-muted animate-pulse"></div>
          <CardContent className="p-4">
            <div className="w-16 h-4 bg-muted rounded animate-pulse mb-2"></div>
            <div className="w-full h-4 bg-muted rounded animate-pulse mb-1"></div>
            <div className="w-3/4 h-3 bg-muted rounded animate-pulse mb-2"></div>
            <div className="w-1/2 h-3 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Personalized Recommendations */}
      {showPersonalized && user && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Recommended for You
              </h2>
              <p className="text-muted-foreground">
                Curated based on your preferences and activity
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRecommendations}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : personalizedServices.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {personalizedServices.slice(0, 4).map((service, index) => {
                  const recommendation = recommendations.find(r => r.serviceId === service.id);
                  return (
                    <Link key={service.id} to={`/service/${service.id}`}>
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
                    <Button variant="outline">
                      View All Recommendations
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Building Your Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Browse and search for services to get personalized recommendations
              </p>
              <Link to="/search">
                <Button>
                  <Eye className="w-4 h-4 mr-2" />
                  Explore Services
                </Button>
              </Link>
            </Card>
          )}
        </section>
      )}

      {/* Trending Services */}
      {showTrending && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                Trending This Week
              </h2>
              <p className="text-muted-foreground">
                Most popular services among our users
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Updated hourly</span>
            </div>
          </div>

          {loadingTrending ? (
            <LoadingSkeleton />
          ) : trendingServices.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {trendingServices.slice(0, 4).map((service) => (
                  <Link key={service.id} to={`/service/${service.id}`}>
                    <ServiceCard service={service} />
                  </Link>
                ))}
              </div>
              
              {trendingServices.length > 4 && (
                <div className="text-center">
                  <Link to="/trending">
                    <Button variant="outline">
                      View All Trending
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Trending Data Yet</h3>
              <p className="text-muted-foreground">
                Check back later for trending services
              </p>
            </Card>
          )}
        </section>
      )}
    </div>
  );
};

export default SmartRecommendations;