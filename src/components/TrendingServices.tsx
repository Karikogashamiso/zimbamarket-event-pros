import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MapPin, ArrowRight, Flame, Sparkles, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "@/components/LazyImage";
import { useServiceCache } from "@/hooks/useServiceCache";
import { Skeleton } from "@/components/ui/skeleton";
import { trackServiceView } from "@/components/Analytics/GoogleAnalytics";

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
    <section className="py-12 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/5 via-primary/5 to-background pointer-events-none" />
      <div className="absolute top-10 right-10 text-primary/5 animate-float hidden lg:block">
        <Flame className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 left-10 text-secondary/5 animate-float delay-2000 hidden lg:block">
        <Sparkles className="w-40 h-40" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-12 lg:mb-16 space-y-4 md:space-y-6">
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full px-6 py-3 border border-orange-500/20 shadow-glow">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Trending This Week
            </span>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
          
          {/* Main Heading */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 md:mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Most Popular
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Discover what's hot right now - the most booked and loved services by customers like you
            </p>
          </div>
          
          {/* Desktop CTA */}
          <Link to="/search?featured=true" className="hidden md:inline-block">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow-primary hover-scale group"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border-0 shadow-elegant"
                style={{
                  animation: `fade-in-up 0.6s ease-out ${index * 0.15}s both`
                }}
              >
                <Skeleton className="w-full h-64" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))
          ) : trendingServices.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground text-lg">No trending services available at the moment</p>
            </div>
          ) : (
            trendingServices.map((service, index) => (
              <Card 
                key={service.id}
                className="group relative overflow-hidden border-0 shadow-elegant hover:shadow-2xl transition-all duration-500 bg-card"
                style={{
                  animation: `fade-in-up 0.6s ease-out ${index * 0.15}s both`
                }}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden aspect-video">
                  <LazyImage
                    src={service.images?.[0] || "/placeholder.svg"}
                    alt={service.title}
                    aspectRatio={16 / 9}
                    className="transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                    placeholder="/placeholder.svg"
                  />
                  
                  {/* Trending Rank Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-4 py-2 shadow-lg animate-glow">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-bold">#{index + 1} Trending</span>
                    </div>
                  </div>
                  
                  {/* Verified Badge */}
                  {service.is_verified && (
                    <Badge className="absolute top-4 right-4 bg-white/95 dark:bg-background/95 text-primary border-primary/20 shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}

                  {/* Quick View Button - Shows on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <Link to={`/service/${service.id}`} className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <Button 
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 shadow-2xl hover-scale"
                        onClick={() => trackServiceView(service.id, service.title)}
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Quick View
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-6 space-y-4">
                  {/* Category Badge */}
                  <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                    {service.category?.name || 'Service'}
                  </Badge>
                  
                  {/* Title */}
                  <Link to={`/service/${service.id}`}>
                    <h3 className="font-display font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {service.title}
                    </h3>
                  </Link>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(service.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-foreground">
                        {service.rating?.toFixed(1) || '5.0'}
                      </span>
                      <span className="text-muted-foreground">
                        ({service.review_count || 0})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs">{service.location || 'Harare'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {service.description || 'Professional service provider'}
                  </p>

                  {/* Price and CTA */}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Starting from</p>
                      <p className="text-2xl font-bold text-primary">
                        ${service.price_from || 0}
                      </p>
                    </div>
                    
                    <Link to={`/service/${service.id}`}>
                      <Button 
                        variant="premium"
                        size="sm"
                        className="hover-scale group/btn"
                        onClick={() => trackServiceView(service.id, service.title)}
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Mobile CTA Button */}
        <div className="text-center mt-8 md:mt-16 md:hidden">
          <Link to="/search?featured=true">
            <Button 
              size="lg"
              className="w-full max-w-md bg-gradient-to-r from-primary to-secondary hover:shadow-glow-primary hover-scale group"
            >
              <span>Explore All Trending Services</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-8 md:mt-16 space-y-3 md:space-y-4">
          <p className="text-sm text-muted-foreground">
            Join thousands of satisfied customers
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-medium">15,000+ Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">98% Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingServices;