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
import { useCategories } from "@/hooks/useCategories";
import { Link } from "react-router-dom";

const CategorySection = () => {
  const { categories, loading, error } = useCategories();

  // Icon mapping
  const iconMap: Record<string, any> = {
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
  };

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Error loading categories: {error}</p>
          </div>
        </div>
      </section>
    );
  }

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
          {loading ? (
            // Loading skeleton
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
                  <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Building2;
              return (
                <Link 
                  key={category.id}
                  to={`/search?category=${category.slug}`}
                  className="bg-card hover:bg-accent/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg border border-border/50 hover:border-primary/20 group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;