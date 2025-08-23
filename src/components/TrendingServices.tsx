import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "@/components/LazyImage";

// Mock trending services data
const trendingServices = [
  {
    id: "1",
    title: "Elegant Garden Weddings",
    category: "Wedding Venues",
    location: "Harare",
    rating: 4.9,
    reviews: 156,
    price: "$800 - $2,500",
    image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
    trending: "🔥 Hot",
    bookings: "+125 this month",
    features: ["Garden Setting", "Catering Available", "Photography Included"]
  },
  {
    id: "2", 
    title: "Premium DJ & Sound",
    category: "Entertainment",
    location: "Bulawayo",
    rating: 4.8,
    reviews: 89,
    price: "$200 - $800",
    image: "/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png",
    trending: "⚡ Rising",
    bookings: "+89 this month",
    features: ["Professional Equipment", "MC Services", "Lighting Setup"]
  },
  {
    id: "3",
    title: "Gourmet Catering Co.",
    category: "Catering",
    location: "Victoria Falls",
    rating: 4.9,
    reviews: 203,
    price: "$15 - $60 per person",
    image: "/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png",
    trending: "👑 Premium",
    bookings: "+78 this month",
    features: ["International Cuisine", "Dietary Options", "Full Service"]
  }
];

const TrendingServices = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                Trending Now
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              Most Popular Services
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
              Discover what's trending in Zimbabwe's event scene - the most booked and highly rated services
            </p>
          </div>
          
          <Link to="/search-results" className="hidden md:block">
            <Button variant="outline" className="hover-scale">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingServices.map((service, index) => (
            <Card 
              key={service.id} 
              className="group overflow-hidden hover-lift cursor-pointer card-elegant"
              style={{
                animation: `fade-in-up 0.8s ease-out ${index * 0.2}s both`
              }}
            >
              <div className="relative overflow-hidden">
                <LazyImage
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Trending badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 left-4 bg-secondary/90 text-secondary-foreground shadow-lg"
                >
                  {service.trending}
                </Badge>
                
                {/* Bookings indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-primary">{service.bookings}</span>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {service.category}
                    </Badge>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="font-medium">{service.rating}</span>
                    <span>({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary">{service.price}</span>
                  </div>
                  
                  <Link to={`/service/${service.id}`}>
                    <Button 
                      variant="premium" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                    >
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile view all button */}
        <div className="text-center mt-12 md:hidden">
          <Link to="/search-results">
            <Button variant="outline" size="lg" className="hover-scale">
              View All Trending Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingServices;