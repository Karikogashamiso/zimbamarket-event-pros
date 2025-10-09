import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Eye, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import LazyImage from "@/components/LazyImage";
import { trackServiceView } from "@/components/Analytics/GoogleAnalytics";
import { SectionErrorBoundary } from "@/components/ErrorBoundary";
import { DataError, LoadingErrorBanner } from "@/components/ui/error-states";

const FeaturedListings = () => {
  const { services, loading, error, retry, isRetrying } = useServices({ featured: true });

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <LoadingErrorBanner
            message="Unable to load featured services. You can still browse other sections."
            onRetry={retry}
            onDismiss={() => window.location.reload()}
          />
          <DataError
            type="services"
            onRetry={retry}
            isRetrying={isRetrying}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 text-primary/5 animate-float">
        <Star className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 right-10 text-secondary/5 animate-float delay-2000">
        <Sparkles className="w-40 h-40" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Featured Services</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-gradient">
            Premium Event Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked collection of Zimbabwe's most trusted and highly-rated event professionals
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            // Enhanced loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card 
                key={index} 
                className="overflow-hidden card-elegant"
                style={{
                  animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="w-full h-64 skeleton"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="w-20 h-5 skeleton"></div>
                  <div className="w-3/4 h-6 skeleton"></div>
                  <div className="w-full h-4 skeleton"></div>
                  <div className="w-5/6 h-4 skeleton"></div>
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-4 skeleton"></div>
                    <div className="w-16 h-6 skeleton"></div>
                  </div>
                  <div className="w-full h-10 skeleton"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            services.slice(0, 6).map((service, index) => (
              <SectionErrorBoundary key={service.id} sectionName="service card" showRetry={false}>
                <Card 
                  className="group overflow-hidden card-interactive border-0 shadow-elegant hover:shadow-2xl"
                  style={{
                    animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative overflow-hidden">
                    <LazyImage 
                      src={service.image_url || "/placeholder.svg"} 
                      alt={service.title}
                      aspectRatio={4 / 3}
                      className="group-hover:scale-110 transition-all duration-700"
                      placeholder="/placeholder.svg"
                    />
                    
                    {/* Enhanced overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {service.is_featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-secondary to-accent text-white font-semibold shadow-lg animate-glow">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                    
                    {/* Enhanced action button */}
                    <div className="absolute top-4 right-4">
                      <Button 
                        variant="glass" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Quick stats overlay */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <div className="flex justify-between items-center text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{service.rating}</span>
                          <span className="opacity-80">({service.review_count})</span>
                        </div>
                        <div className="font-bold">
                          {service.price_from ? `$${service.price_from}+` : 'Custom'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        {service.category?.name || 'Service'}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{service.location}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-secondary text-secondary" />
                          <span className="text-sm font-semibold">{service.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {service.review_count} reviews
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {service.price_from ? `From $${service.price_from}` : 'Quote'}
                        </p>
                      </div>
                    </div>
                    
                    <Link to={`/service/${service.id}`}>
                      <Button 
                        variant="premium"
                        className="w-full hover-scale group/btn" 
                        size="sm"
                        onClick={() => trackServiceView(service.id, service.title)}
                      >
                        <span>View Details</span>
                        <Eye className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>
            ))
          )}
        </div>
        
        {/* Enhanced View All Button */}
        <div className="text-center">
          <Link to="/search">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-12 py-4 h-auto border-2 hover:border-primary hover:shadow-glow-primary hover-scale group"
            >
              <span>Explore All Services</span>
              <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;