import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "@/components/LazyImage";
import { useServiceCache } from "@/hooks/useServiceCache";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingServices = () => {
  const { services, loading } = useServiceCache();
  
  // Get top featured services
  const trendingServices = services
    .filter(service => service.featured && service.active)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  // Don't render if no services
  if (!loading && trendingServices.length === 0) {
    return null;
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-background via-muted/20 to-background rounded-lg p-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
                <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                  Trending Now
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
                Trending This Week
              </h2>
              <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
                Discover the most popular and highly rated services in Zimbabwe
              </p>
            </div>
            
            <Link to="/search?featured=true" className="hidden md:block">
              <Button variant="outline" className="hover-scale">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))
            ) : (
              trendingServices.map((service, index) => (
                <Card 
                  key={service.id} 
                  className="group overflow-hidden hover-lift cursor-pointer card-elegant"
                  style={{
                    animation: `fade-in-up 0.8s ease-out ${index * 0.2}s both`
                  }}
                >
                  <div className="relative overflow-hidden">
                    <LazyImage
                      src={service.images?.[0] || "/placeholder.svg"}
                      alt={service.title}
                      aspectRatio={16 / 9}
                      className="transition-transform duration-500 group-hover:scale-110"
                      placeholder="/placeholder.svg"
                    />
                    
                    {/* Trending badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute top-4 left-4 bg-secondary/90 text-secondary-foreground shadow-lg"
                    >
                      🔥 Trending
                    </Badge>
                    
                    {service.is_verified && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-xs font-medium text-primary">Verified</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge variant="outline" className="text-xs mb-2">
                          {service.category?.name || 'Service'}
                        </Badge>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-secondary fill-secondary" />
                        <span className="font-medium">{service.rating?.toFixed(1) || '5.0'}</span>
                        <span>({service.review_count || 0})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{service.location || 'Harare'}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">From </span>
                        <span className="text-lg font-bold text-primary">
                          ${service.price_from || 0}
                        </span>
                      </div>
                      
                      <Link to={`/service/${service.id}`}>
                        <Button 
                          variant="premium" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Mobile view all button */}
          <div className="text-center mt-12 md:hidden">
            <Link to="/search?featured=true">
              <Button variant="outline" size="lg" className="hover-scale">
                View All Trending Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingServices;