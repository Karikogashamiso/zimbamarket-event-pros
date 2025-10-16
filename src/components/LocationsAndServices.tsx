import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  MapPin,
  Building2,
  Users,
  Heart,
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react";
import { useVenueAndServiceCounts } from "@/hooks/useVenueAndServiceCounts";
import { Skeleton } from "@/components/ui/skeleton";

const LocationsAndServices = () => {
  const { data: counts, isLoading } = useVenueAndServiceCounts();

  const formatCount = (num: number | undefined) => {
    if (!num || num === 0) return "0";
    return num > 0 ? `${num}` : "0";
  };

  const venueLocations = [
    { name: "All Venues", count: formatCount(counts?.totalVenues), url: "/search?category=venues" },
    { name: "Venues in Harare", count: formatCount(counts?.venuesByLocation["Harare"]), url: "/search?category=venues&location=Harare" },
    { name: "Venues in Bulawayo", count: formatCount(counts?.venuesByLocation["Bulawayo"]), url: "/search?category=venues&location=Bulawayo" },
    { name: "Venues in Mutare", count: formatCount(counts?.venuesByLocation["Mutare"]), url: "/search?category=venues&location=Mutare" },
    { name: "Venues in Gweru", count: formatCount(counts?.venuesByLocation["Gweru"]), url: "/search?category=venues&location=Gweru" },
    { name: "Venues in Kwekwe", count: formatCount(counts?.venuesByLocation["Kwekwe"]), url: "/search?category=venues&location=Kwekwe" },
    { name: "Venues in Masvingo", count: formatCount(counts?.venuesByLocation["Masvingo"]), url: "/search?category=venues&location=Masvingo" },
    { name: "Venues in Chinhoyi", count: formatCount(counts?.venuesByLocation["Chinhoyi"]), url: "/search?category=venues&location=Chinhoyi" },
    { name: "Venues in Victoria Falls", count: formatCount(counts?.venuesByLocation["Victoria Falls"]), url: "/search?category=venues&location=Victoria Falls" },
    { name: "Wedding Venues in Harare", count: formatCount(counts?.venuesByLocation["Harare"]), url: "/search?category=wedding-venues&location=Harare" },
    { name: "Wedding Venues in Bulawayo", count: formatCount(counts?.venuesByLocation["Bulawayo"]), url: "/search?category=wedding-venues&location=Bulawayo" },
    { name: "Conference Centers in Harare", count: formatCount(counts?.venuesByLocation["Harare"]), url: "/search?category=conference-venues&location=Harare" }
  ];

  const serviceProviders = [
    { name: "All Event Service Providers", count: formatCount(counts?.totalServices), url: "/search?category=event-services" },
    { name: "Bakers & Cake Designers", count: formatCount(counts?.servicesByCategory.bakers), url: "/search?category=catering&q=bakers" },
    { name: "Bartending Services", count: formatCount(counts?.servicesByCategory.bartending), url: "/search?category=catering&q=bartending" },
    { name: "Catering Companies", count: formatCount(counts?.servicesByCategory.catering), url: "/search?category=catering" },
    { name: "Decor Services", count: formatCount(counts?.servicesByCategory.decor), url: "/search?category=decor" },
    { name: "Event Planners", count: formatCount(counts?.servicesByCategory.eventPlanning), url: "/search?category=event-planning" },
    { name: "Lighting & Sound Services", count: formatCount(counts?.servicesByCategory.audioVisual), url: "/search?category=audio-visual" },
    { name: "Photographers", count: formatCount(counts?.servicesByCategory.photography), url: "/search?category=photography" },
    { name: "Private Chefs", count: formatCount(counts?.servicesByCategory.privateChef), url: "/search?category=catering&q=private chef" },
    { name: "Wedding Planners", count: formatCount(counts?.servicesByCategory.weddingPlanning), url: "/search?category=event-planning&q=wedding" },
    { name: "All Event Entertainers", count: formatCount(counts?.servicesByCategory.entertainment), url: "/search?category=entertainment" },
    { name: "Live Bands", count: formatCount(counts?.servicesByCategory.bands), url: "/search?category=entertainment&q=bands" },
    { name: "Gospel Choirs", count: formatCount(counts?.servicesByCategory.gospel), url: "/search?category=entertainment&q=gospel choir" },
    { name: "Professional DJs", count: formatCount(counts?.servicesByCategory.dj), url: "/search?category=dj" },
    { name: "Magicians", count: formatCount(counts?.servicesByCategory.magicians), url: "/search?category=entertainment&q=magicians" },
    { name: "Master of Ceremonies", count: formatCount(counts?.servicesByCategory.mc), url: "/search?category=entertainment&q=mc" },
    { name: "Solo Singers", count: formatCount(counts?.servicesByCategory.singers), url: "/search?category=entertainment&q=singers" }
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
              {isLoading ? (
                Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))
              ) : (
                venueLocations.map((location, index) => (
                  <Link 
                    key={index} 
                    to={location.url}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group block"
                  >
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {location.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-primary border-primary">
                        {location.count}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </Link>
                ))
              )}
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
              {isLoading ? (
                Array.from({ length: 17 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))
              ) : (
                serviceProviders.map((service, index) => (
                  <Link 
                    key={index} 
                    to={service.url}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer group block"
                  >
                    <span className="text-foreground group-hover:text-secondary transition-colors">
                      {service.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-secondary border-secondary">
                        {service.count}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </Link>
                ))
              )}
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