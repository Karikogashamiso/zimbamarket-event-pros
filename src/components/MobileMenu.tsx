import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Building2, Users, Music, PlusCircle, Heart, HelpCircle } from "lucide-react";
import AuthDialog from "./AuthDialog";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Building2, label: "Venues", href: "/categories?category=venues" },
    { icon: Users, label: "Service Providers", href: "/categories?category=services" },
    { icon: Music, label: "Entertainers", href: "/categories?category=entertainment" },
    { icon: PlusCircle, label: "List Your Business", href: "/list-business" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-x-0 top-0 z-50 h-full w-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 pt-20">
        <Card className="mx-auto max-w-md bg-white/95 backdrop-blur-md shadow-2xl">
          <div className="p-6">
            {/* Auth Buttons */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <AuthDialog>
                  <Button variant="outline" className="w-full h-12 text-base font-medium">
                    Register
                  </Button>
                </AuthDialog>
                <AuthDialog>
                  <Button className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90">
                    Login
                  </Button>
                </AuthDialog>
              </div>
              <Link to="/list-business" onClick={onClose}>
                <Button className="w-full h-12 text-base font-medium bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Listing
                </Button>
              </Link>
            </div>

            <Separator className="my-6" />

            {/* Navigation Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.href} to={item.href} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-base font-medium text-foreground hover:bg-muted"
                  >
                    <item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <Separator className="my-6" />

            {/* Additional Actions */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base font-medium text-foreground hover:bg-muted"
              >
                <Heart className="mr-3 h-5 w-5 text-muted-foreground" />
                Favorites
              </Button>
              <Link to="/help" onClick={onClose}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base font-medium text-foreground hover:bg-muted"
                >
                  <HelpCircle className="mr-3 h-5 w-5 text-muted-foreground" />
                  Need Help?
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MobileMenu;