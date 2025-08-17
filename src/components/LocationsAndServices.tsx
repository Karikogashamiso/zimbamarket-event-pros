import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Building2,
  Users,
  Heart,
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react";

const LocationsAndServices = () => {
  const venueLocations = [
    { name: "All Venues", count: "150+" },
    { name: "Venues in Harare", count: "65+" },
    { name: "Venues in Bulawayo", count: "35+" },
    { name: "Venues in Mutare", count: "15+" },
    { name: "Venues in Gweru", count: "12+" },
    { name: "Venues in Kwekwe", count: "8+" },
    { name: "Venues in Masvingo", count: "10+" },
    { name: "Venues in Chinhoyi", count: "6+" },
    { name: "Venues in Victoria Falls", count: "20+" },
    { name: "Wedding Venues in Harare", count: "45+" },
    { name: "Wedding Venues in Bulawayo", count: "25+" },
    { name: "Conference Centers in Harare", count: "30+" }
  ];

  const serviceProviders = [
    { name: "All Event Service Providers", count: "500+" },
    { name: "Wedding Planners", count: "45+" },
    { name: "Catering Companies", count: "80+" },
    { name: "Professional DJs", count: "120+" },
    { name: "Photographers", count: "90+" },
    { name: "Videographers", count: "55+" },
    { name: "Event Decorators", count: "70+" },
    { name: "Florists", count: "40+" },
    { name: "Bakers & Cake Designers", count: "60+" },
    { name: "Beauty & Makeup Artists", count: "35+" },
    { name: "Live Musicians & Bands", count: "75+" },
    { name: "Sound & Lighting", count: "40+" },
    { name: "Transportation Services", count: "25+" },
    { name: "Security Services", count: "20+" },
    { name: "Event Officiants", count: "18+" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nationwide Coverage</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Venues & Services Across <span className="text-primary">Zimbabwe</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            From bustling cities to scenic destinations, we connect you with trusted event professionals in every corner of Zimbabwe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Event Venues */}
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Event Venues</h3>
                <p className="text-muted-foreground">Premium locations for every occasion</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {venueLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group">
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {location.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-primary border-primary">
                      {location.count}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Event Service Providers */}
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary">Event Service Providers</h3>
                <p className="text-muted-foreground">Professional services for perfect events</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {serviceProviders.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer group">
                  <span className="text-foreground group-hover:text-secondary transition-colors">
                    {service.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-secondary border-secondary">
                      {service.count}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quality Assurance */}
        <div className="text-center mt-16">
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Quality Guaranteed</h3>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Every venue and service provider on ZimEventPro is thoroughly vetted to ensure you receive only the highest quality services for your special event.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <Star className="w-3 h-3 mr-1" />
                Verified Professionals
              </Badge>
              <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                <Heart className="w-3 h-3 mr-1" />
                Customer Satisfaction
              </Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Quality Assurance
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LocationsAndServices;