import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  Calendar,
  MapPin,
  Users,
  Ticket,
  Search,
  Heart,
  User,
  Building2,
  Music,
  Camera,
  Utensils,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const OptimizedNavigation = () => {
  const [activeSection, setActiveSection] = useState("browse");

  const categories = [
    { name: "Venues", icon: Building2, count: "200+", href: "/categories?cat=venues" },
    { name: "Catering", icon: Utensils, count: "150+", href: "/categories?cat=catering" },
    { name: "DJs & Music", icon: Music, count: "120+", href: "/categories?cat=dj" },
    { name: "Photography", icon: Camera, count: "180+", href: "/categories?cat=photography" }
  ];

  const quickActions = [
    { name: "Book Tickets", icon: Ticket, href: "/tickets", popular: true },
    { name: "Find Venues", icon: MapPin, href: "/categories?cat=venues" },
    { name: "Event Planning", icon: Calendar, href: "/categories?cat=planning" },
    { name: "Join as Vendor", icon: Users, href: "/list-business" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      {/* Top Bar - Quick Actions */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span>📍 Harare • Victoria Falls • Bulawayo</span>
              <Badge variant="secondary" className="text-xs">24/7 Support</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/help" className="hover:underline">Help</Link>
              <Link to="/contact" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              Zim<span className="text-secondary">EventPro</span>
            </h1>
          </Link>

          {/* Primary Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* Browse Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="text-base font-medium"
                  onMouseEnter={() => setActiveSection("browse")}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Browse Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-96 p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Popular Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.href}
                          className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <category.icon className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">{category.count} providers</div>
                          </div>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/categories">View All Categories</Link>
                    </Button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Quick Book */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-base font-medium">
                  <Ticket className="w-4 h-4 mr-2" />
                  Quick Book
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-80 p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Book Instantly</h3>
                    <div className="space-y-2">
                      {quickActions.map((action) => (
                        <Link
                          key={action.name}
                          to={action.href}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-center">
                            <action.icon className="w-5 h-5 mr-3 text-primary" />
                            <span className="font-medium">{action.name}</span>
                            {action.popular && (
                              <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* For Business */}
              <NavigationMenuItem>
                <Link 
                  to="/list-business"
                  className="flex items-center text-base font-medium px-4 py-2 hover:text-primary transition-colors"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  For Business
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>
            <Button className="bg-gradient-to-r from-primary to-secondary text-white">
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Breadcrumb */}
      <div className="lg:hidden border-t border-border/50 py-2 px-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span>Current Page</span>
        </div>
      </div>
    </header>
  );
};

export default OptimizedNavigation;