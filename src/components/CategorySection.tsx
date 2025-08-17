import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Building2, 
  UtensilsCrossed, 
  Music2, 
  Camera, 
  Palette,
  Users
} from "lucide-react";

const categories = [
  {
    icon: Building2,
    title: "Venues",
    description: "Wedding halls, conference centers, gardens",
    count: "150+ venues"
  },
  {
    icon: UtensilsCrossed,
    title: "Catering",
    description: "Professional catering services",
    count: "80+ caterers"
  },
  {
    icon: Music2,
    title: "DJs & Entertainment",
    description: "Music, sound, and entertainment",
    count: "120+ entertainers"
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Capture your special moments",
    count: "90+ photographers"
  },
  {
    icon: Palette,
    title: "Décor & Rentals",
    description: "Beautiful decorations and rentals",
    count: "60+ decorators"
  },
  {
    icon: Users,
    title: "Event Planners",
    description: "Full-service event planning",
    count: "40+ planners"
  }
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse by <span className="text-primary">Category</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect services for your event from our trusted network of professionals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-card-hover transition-all duration-300 border-none bg-white shadow-card group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-3">{category.description}</p>
                  <p className="text-sm font-medium text-secondary">{category.count}</p>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;