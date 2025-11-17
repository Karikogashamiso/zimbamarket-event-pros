import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Eye, Sparkles, Building2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import LazyImage from "@/components/LazyImage";
import { trackServiceView } from "@/components/Analytics/GoogleAnalytics";
import { SectionErrorBoundary } from "@/components/ErrorBoundary";
import { DataError, LoadingErrorBanner } from "@/components/ui/error-states";

const FeaturedListings = () => {
  const { listings, loading, error, retry } = useBusinessListings({ featured: true });

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <LoadingErrorBanner
            message="Unable to load featured businesses. You can still browse other sections."
            onRetry={retry}
            onDismiss={() => window.location.reload()}
          />
          <DataError
            type="services"
            onRetry={retry}
            isRetrying={false}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 text-primary/5 animate-float">
        <Star className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 right-10 text-secondary/5 animate-float delay-2000">
        <Sparkles className="w-40 h-40" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Featured Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6 text-gradient">
            Featured Businesses
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Discover Zimbabwe's most trusted event service providers and their offerings
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
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
            listings.slice(0, 6).map((listing, index) => (
              <SectionErrorBoundary key={listing.id} sectionName="business card" showRetry={false}>
                <Card 
                  className="group overflow-hidden card-interactive border-0 shadow-elegant hover:shadow-2xl"
                  style={{
                    animation: `fade-in-up 0.8s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative overflow-hidden">
                    <LazyImage 
                      src={
                        listing.images?.[0] || 
                        listing.services?.[0]?.images?.[0] || 
                        "/placeholder.svg"
                      } 
                      alt={listing.business_name}
                      aspectRatio={4 / 3}
                      className="group-hover:scale-110 transition-all duration-700"
                      placeholder="/placeholder.svg"
                    />
                    
                    {/* Enhanced overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {listing.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-secondary to-accent text-white font-semibold shadow-lg animate-glow">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
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
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        {listing.category?.name || 'Business'}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors leading-tight">
                        {listing.business_name}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                    
                    {/* Services under this business */}
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Services ({listing.services?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {listing.services?.slice(0, 3).map((service: any) => (
                          <div key={service.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="truncate">{service.title}</span>
                            {service.is_verified && (
                              <Badge variant="outline" className="text-xs h-5 bg-blue-50 text-blue-600 border-blue-200">
                                Verified
                              </Badge>
                            )}
                          </div>
                        ))}
                        {listing.services?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{listing.services.length - 3} more services
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Link to={`/business/${listing.id}`}>
                      <Button 
                        variant="premium"
                        className="w-full hover-scale group/btn" 
                        size="sm"
                        onClick={() => trackServiceView(listing.id, listing.business_name)}
                      >
                        <span>View Business</span>
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
              <span>Explore All Businesses</span>
              <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;