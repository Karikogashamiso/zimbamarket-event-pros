import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart } from "lucide-react";
import venue1 from "@/assets/venue-1.jpg";
import catering1 from "@/assets/catering-1.jpg";
import dj1 from "@/assets/dj-1.jpg";

const featuredServices = [
  {
    id: 1,
    title: "Royal Gardens Wedding Venue",
    category: "Venue",
    location: "Harare, Zimbabwe",
    price: "From $500",
    rating: 4.9,
    reviews: 127,
    image: venue1,
    featured: true,
    description: "Elegant garden venue perfect for weddings and celebrations"
  },
  {
    id: 2,
    title: "Premium African Cuisine Catering",
    category: "Catering",
    location: "Bulawayo, Zimbabwe",
    price: "From $25/person",
    rating: 4.8,
    reviews: 89,
    image: catering1,
    featured: true,
    description: "Authentic Zimbabwean cuisine with modern presentation"
  },
  {
    id: 3,
    title: "EliteBeats DJ Services",
    category: "Entertainment",
    location: "Victoria Falls, Zimbabwe",
    price: "From $200",
    rating: 5.0,
    reviews: 156,
    image: dj1,
    featured: false,
    description: "Professional DJ services for all types of events"
  }
];

const FeaturedListings = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="text-primary">Services</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Handpicked professionals ready to make your event exceptional
            </p>
          </div>
          <Button variant="outline" className="hidden md:block">
            View All Featured
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden border-none shadow-card hover:shadow-card-hover transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {service.featured && (
                  <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                    Featured
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-600 hover:text-accent"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {service.category}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-3">
                  {service.description}
                </p>
                
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{service.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({service.reviews} reviews)
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{service.price}</p>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12 md:hidden">
          <Button variant="outline">
            View All Featured
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;