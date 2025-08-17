import { 
  Building2, 
  Utensils, 
  Music, 
  Camera, 
  Users, 
  Cake,
  Car,
  Flower,
  Palette,
  Mic2,
  Sparkles,
  Gift,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CategorySection = () => {
  const categories = [
    {
      icon: Building2,
      title: "Venues",
      description: "Wedding halls, conference centers, outdoor spaces",
      count: "150+ venues",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      trending: true
    },
    {
      icon: Utensils,
      title: "Catering",
      description: "Professional catering services for all occasions",
      count: "80+ caterers",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: Music,
      title: "DJs & Music",
      description: "Professional DJs and live music entertainment",
      count: "120+ artists",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      trending: true
    },
    {
      icon: Camera,
      title: "Photography",
      description: "Capture your special moments professionally",
      count: "90+ photographers",
      color: "bg-gradient-to-br from-pink-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Event Planning",
      description: "Full-service event planning and coordination",
      count: "45+ planners",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      icon: Cake,
      title: "Bakery Services",
      description: "Custom cakes and desserts for your celebration",
      count: "60+ bakers",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600"
    },
    {
      icon: Car,
      title: "Transportation",
      description: "Luxury transport and logistics services",
      count: "35+ providers",
      color: "bg-gradient-to-br from-red-500 to-red-600"
    },
    {
      icon: Flower,
      title: "Floral & Decor",
      description: "Beautiful flowers and event decoration",
      count: "70+ decorators",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      trending: true
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-secondary rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-primary rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Explore Our Services</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Browse by Category
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover Zimbabwe's finest event professionals, all verified and ready to make your celebration extraordinary
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {categories.map((category, index) => (
            <div key={index} className="group cursor-pointer animate-fade-in hover-scale" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="bg-card/50 backdrop-blur-sm hover:bg-card/80 rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-500 h-full hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden">
                {/* Trending Badge */}
                {category.trending && (
                  <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}
                
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className={`${category.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors duration-300">
                    {category.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {category.count}
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Categories Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="group text-lg px-8 py-3 h-auto border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            View All Categories
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;