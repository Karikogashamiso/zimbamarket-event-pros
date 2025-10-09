import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "@/components/LazyImage";
import meiklesHotel from "@/assets/meikles-hotel.jpg";
import rainbowTowersHotel from "@/assets/rainbow-towers-hotel.jpg";
import crestaLodgeHarare from "@/assets/cresta-lodge-harare.jpg";

// Mock trending hotels data
const trendingServices = [
  {
    id: "1",
    title: "Meikles Hotel",
    category: "Luxury Hotel",
    location: "Harare",
    rating: 4.8,
    reviews: 342,
    price: "$120 - $280 per night",
    image: meiklesHotel,
    trending: "🔥 Hot",
    bookings: "+156 this month",
    features: ["Free WiFi", "Pool & Spa", "Restaurant", "Business Center"]
  },
  {
    id: "2", 
    title: "Rainbow Towers Hotel",
    category: "Business Hotel",
    location: "Harare",
    rating: 4.6,
    reviews: 287,
    price: "$95 - $180 per night",
    image: rainbowTowersHotel,
    trending: "⚡ Rising",
    bookings: "+98 this month",
    features: ["Conference Facilities", "Gym", "Restaurant", "City Views"]
  },
  {
    id: "3",
    title: "Cresta Lodge Harare",
    category: "Boutique Hotel",
    location: "Harare",
    rating: 4.7,
    reviews: 198,
    price: "$80 - $150 per night",
    image: crestaLodgeHarare,
    trending: "👑 Premium",
    bookings: "+67 this month",
    features: ["Garden Setting", "Pool", "Bar & Lounge", "Free Parking"]
  }
];

const TrendingServices = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 bg-gradient-to-br from-background via-muted/20 to-background rounded-lg p-8">
        <div className="flex items-center justify-between mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                Trending Now
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              Top Harare Hotels
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
              Discover Harare's finest accommodations - the most booked and highly rated hotels in the capital
            </p>
          </div>
          
          <Link to="/search?category=venues" className="hidden md:block">
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
                  aspectRatio={16 / 9}
                  className="transition-transform duration-500 group-hover:scale-110"
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
          <Link to="/search?category=venues">
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