import { 
  Building2, 
  Utensils, 
  Wine, 
  Music, 
  Users2, 
  Flower,
  Palette,
  Camera,
  Video,
  Cake,
  Piano,
  UserCheck,
  Scissors,
  Mic,
  Shield,
  Guitar,
  Lightbulb,
  Speaker,
  Image,
  ChefHat,
  ShoppingBag,
  Heart
} from "lucide-react";

const CategorySection = () => {
  const categories = [
    { icon: Building2, title: "Venues" },
    { icon: Utensils, title: "Catering" },
    { icon: Wine, title: "Bar" },
    { icon: Music, title: "DJ" },
    { icon: Users2, title: "Entertainers" },
    { icon: Flower, title: "Flowers" },
    { icon: Palette, title: "Decor" },
    { icon: Camera, title: "Photographers" },
    { icon: Video, title: "Videographers" },
    { icon: Cake, title: "Bakers" },
    { icon: Piano, title: "Musicians" },
    { icon: UserCheck, title: "Event Planners" },
    { icon: Scissors, title: "Beauty" },
    { icon: Mic, title: "Event Speakers" },
    { icon: Shield, title: "Event Safety" },
    { icon: Guitar, title: "Bands" },
    { icon: Lightbulb, title: "Lighting" },
    { icon: Speaker, title: "Sound" },
    { icon: Image, title: "Photo Booths" },
    { icon: ChefHat, title: "Private Chefs" },
    { icon: ShoppingBag, title: "Food Stands" },
    { icon: Heart, title: "Officiants" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find the perfect service providers for your event
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-card hover:bg-accent/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg border border-border/50 hover:border-primary/20 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300">
                  <category.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                  {category.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;