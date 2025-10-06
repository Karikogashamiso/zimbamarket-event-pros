import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const locations = [
  {
    name: "Harare",
    description: "Capital city with premium venues",
    count: "120+ listings",
    gradient: "from-primary to-primary/70"
  },
  {
    name: "Bulawayo",
    description: "Industrial hub with unique venues",
    count: "85+ listings",
    gradient: "from-secondary to-secondary/70"
  },
  {
    name: "Victoria Falls",
    description: "Tourist destination with scenic venues",
    count: "45+ listings", 
    gradient: "from-accent to-accent/70"
  },
  {
    name: "Mutare",
    description: "Mountain city with natural beauty",
    count: "30+ listings",
    gradient: "from-primary/80 to-secondary/60"
  },
  {
    name: "Masvingo",
    description: "Historic city near Great Zimbabwe",
    count: "25+ listings",
    gradient: "from-accent/80 to-primary/60"
  },
  {
    name: "Chitungwiza",
    description: "Residential area near Harare",
    count: "20+ listings",
    gradient: "from-secondary/80 to-accent/60"
  }
];

const LocationSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse by <span className="text-secondary">Location</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing event services across Zimbabwe's major cities and towns
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <Link key={index} to={`/search?location=${encodeURIComponent(location.name)}`}>
              <Card className="group cursor-pointer border-none shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                <div className={`bg-gradient-to-br ${location.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">{location.name}</h3>
                    <p className="text-white/90 mb-4">{location.description}</p>
                    <p className="text-sm font-medium text-white/80">{location.count}</p>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/search">
            <Button variant="default" size="lg">
              Explore All Locations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;