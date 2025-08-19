import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useServices } from "@/hooks/useServices";

const FeaturedListings = () => {
  const { services, loading, error } = useServices({ featured: true });

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Error loading featured services: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our top-rated and verified event professionals across Zimbabwe
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-64 bg-muted animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="w-20 h-6 bg-muted rounded animate-pulse mb-3"></div>
                  <div className="w-3/4 h-6 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="w-full h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="w-5/6 h-4 bg-muted rounded animate-pulse mb-4"></div>
                  <div className="w-1/2 h-4 bg-muted rounded animate-pulse mb-4"></div>
                  <div className="w-full h-10 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            services.slice(0, 6).map((service) => (
              <Card key={service.id} className="group overflow-hidden hover-lift border-0 shadow-elegant hover:shadow-2xl transition-all duration-500">
                <div className="relative overflow-hidden">
                   <LazyImage 
                     src={service.image_url || "/placeholder.svg"} 
                     alt={service.title}
                     className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                     placeholder="/placeholder.svg"
                     blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAAVAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAGhEAAwEBAQAAAAAAAAAAAAAAAAECEQMh/9oADAMBAAIRAxEAPwA5AAAD/9k="
                   />
                  
                  {service.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-secondary text-white font-semibold shadow-lg">
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-white/90 hover:bg-white text-gray-600 hover:text-primary shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-medium">
                      {service.category?.name || 'Service'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-display">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{service.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{service.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({service.review_count} reviews)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {service.price_from ? `From $${service.price_from}` : 'Contact for pricing'}
                      </p>
                    </div>
                  </div>
                  
                  <Link to={`/service/${service.id}`}>
                    <Button className="w-full hover-scale" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/search">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 h-auto border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;