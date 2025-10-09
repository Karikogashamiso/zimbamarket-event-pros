import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Building2, Users, Music, PlusCircle, Heart, HelpCircle, User, LogOut, Ticket, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out. Come back soon!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Building2, label: "Venues", href: "/categories?category=venues" },
    { icon: Users, label: "Service Providers", href: "/categories?category=services" },
    { icon: Music, label: "Entertainers", href: "/categories?category=entertainment" },
    { icon: Ticket, label: "Events & Tickets", href: "/events" },
    { icon: Settings, label: "Organizer Dashboard", href: "/organizer" },
    { icon: PlusCircle, label: "List Your Business", href: "/list-business" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-x-0 top-0 z-50 h-full w-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 pt-20">
        <Card className="mx-auto max-w-md bg-white/95 backdrop-blur-md shadow-2xl">
          <div className="p-6">
            {/* Auth Section */}
            <div className="mb-6 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        {user.user_metadata?.first_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-base font-medium"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/auth?tab=login" onClick={onClose}>
                    <Button variant="outline" className="w-full h-12 text-base font-medium">
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?tab=signup" onClick={onClose}>
                    <Button className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
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
              {isAdmin && (
                <Link to="/admin" onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-base font-medium text-primary hover:bg-primary/10"
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
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
              <Link to="/profile" onClick={onClose}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base font-medium text-foreground hover:bg-muted"
                >
                  <User className="mr-3 h-5 w-5 text-muted-foreground" />
                  My Profile & Bookings
                </Button>
              </Link>
              <Link to="/favorites" onClick={onClose}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base font-medium text-foreground hover:bg-muted"
                >
                  <Heart className="mr-3 h-5 w-5 text-muted-foreground" />
                  Favorites
                </Button>
              </Link>
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