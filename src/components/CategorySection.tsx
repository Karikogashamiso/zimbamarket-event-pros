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
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-card rounded-3xl p-6 border border-border/50">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-2xl animate-pulse"></div>
                  <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Building2;
              
              // Create vibrant color themes for different categories
              const getThemeColors = (categoryName: string, index: number) => {
                const themes = [
                  { bg: "from-purple-500 to-purple-700", icon: "text-white", hover: "hover:from-purple-600 hover:to-purple-800" },
                  { bg: "from-pink-500 to-rose-600", icon: "text-white", hover: "hover:from-pink-600 hover:to-rose-700" },
                  { bg: "from-blue-500 to-indigo-600", icon: "text-white", hover: "hover:from-blue-600 hover:to-indigo-700" },
                  { bg: "from-emerald-500 to-teal-600", icon: "text-white", hover: "hover:from-emerald-600 hover:to-teal-700" },
                  { bg: "from-amber-500 to-orange-600", icon: "text-white", hover: "hover:from-amber-600 hover:to-orange-700" },
                  { bg: "from-red-500 to-red-700", icon: "text-white", hover: "hover:from-red-600 hover:to-red-800" },
                  { bg: "from-cyan-500 to-blue-600", icon: "text-white", hover: "hover:from-cyan-600 hover:to-blue-700" },
                  { bg: "from-green-500 to-emerald-600", icon: "text-white", hover: "hover:from-green-600 hover:to-emerald-700" },
                  { bg: "from-violet-500 to-purple-600", icon: "text-white", hover: "hover:from-violet-600 hover:to-purple-700" },
                  { bg: "from-fuchsia-500 to-pink-600", icon: "text-white", hover: "hover:from-fuchsia-600 hover:to-pink-700" },
                  { bg: "from-lime-500 to-green-600", icon: "text-white", hover: "hover:from-lime-600 hover:to-green-700" },
                  { bg: "from-sky-500 to-cyan-600", icon: "text-white", hover: "hover:from-sky-600 hover:to-cyan-700" }
                ];
                return themes[index % themes.length];
              };

              const theme = getThemeColors(category.name, index);
              
              return (
                <Link 
                  key={category.id}
                  to={`/search?category=${category.slug}`}
                  className="group relative overflow-hidden"
                  style={{
                    animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="bg-white dark:bg-card rounded-3xl p-6 transition-all duration-500 cursor-pointer hover:scale-110 hover:-translate-y-2 border border-border/20 hover:border-white/30 group-hover:shadow-2xl hover:shadow-primary/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.bg} ${theme.hover} transition-all duration-500 flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 shadow-lg group-hover:shadow-xl`}>
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.bg} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 scale-150`}></div>
                        
                        {/* Icon with enhanced styling */}
                        <IconComponent className={`w-8 h-8 ${theme.icon} relative z-10 transition-all duration-300 group-hover:scale-110 drop-shadow-sm`} />
                        
                        {/* Sparkle effect */}
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                        <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 animate-pulse"></div>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-105">
                          {category.name}
                        </h3>
                        <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-500 mx-auto rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute top-4 left-4 w-1 h-1 bg-primary rounded-full animate-float delay-0"></div>
                      <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-secondary rounded-full animate-float delay-300"></div>
                      <div className="absolute bottom-6 left-6 w-1 h-1 bg-accent rounded-full animate-float delay-700"></div>
                    </div>
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