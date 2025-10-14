import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Heart, LogOut, Search, User, Shield, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

const Header = ({ variant = "transparent" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasBusinessListings, setHasBusinessListings] = useState(false);
  const [hasOrganizerProfile, setHasOrganizerProfile] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setHasBusinessListings(false);
        setHasOrganizerProfile(false);
        return;
      }

      try {
        // Check admin status
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!roleData);

        // Check business listings
        const { data: listingsData } = await supabase
          .from('business_listings')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        setHasBusinessListings(!!listingsData);

        // Check organizer profile
        const { data: organizerData } = await supabase
          .from('organizers')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        setHasOrganizerProfile(!!organizerData);
      } catch (error) {
        console.error('Error checking user access:', error);
      }
    };

    checkUserAccess();
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
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const headerStyles = variant === "solid" 
    ? "bg-white dark:bg-card border-border shadow-md" 
    : "bg-white/20 md:bg-white/10 backdrop-blur-md border-white/30 md:border-white/20 shadow-lg md:shadow-none";

  const textStyles = variant === "solid"
    ? "text-foreground"
    : "text-white";

  const logoAccentStyles = variant === "solid"
    ? "text-secondary"
    : "text-secondary";

  const searchStyles = variant === "solid"
    ? "bg-muted border-border text-foreground placeholder:text-muted-foreground"
    : "bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20";

  const buttonStyles = variant === "solid"
    ? "hover:bg-muted"
    : "hover:bg-white/20";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${headerStyles}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-8">
            <h1 className={`text-2xl md:text-3xl font-bold ${textStyles}`}>
              Zim<span className={logoAccentStyles}>EventPro</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/categories" className={`${textStyles} hover:text-secondary transition-colors font-medium`}>Browse</Link>
            <Link to="/events" className={`${textStyles} hover:text-secondary transition-colors font-medium`}>Events & Tickets</Link>
            <Link to="/organizer" className={`${textStyles} hover:text-secondary transition-colors font-medium`}>Organizer</Link>
            <Link to="/about" className={`${textStyles} hover:text-secondary transition-colors font-medium`}>About</Link>
            <Link to="/contact" className={`${textStyles} hover:text-secondary transition-colors font-medium`}>Contact</Link>
          </nav>
          
          {/* Desktop Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${variant === "solid" ? "text-muted-foreground" : "text-white/70"}`} />
              <Input
                placeholder="Search services..."
                className={`pl-10 ${searchStyles}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(target.value.trim())}`;
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className={`${textStyles} ${buttonStyles}`}>
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`flex items-center gap-2 ${variant === "solid" ? "text-foreground hover:bg-muted hover:text-foreground" : "text-white hover:bg-white/20 hover:text-white"}`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {user.user_metadata?.first_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {hasBusinessListings && (
                    <DropdownMenuItem asChild>
                      <Link to="/service-provider" className="flex items-center cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Service Provider Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {hasOrganizerProfile && (
                    <DropdownMenuItem asChild>
                      <Link to="/organizer" className="flex items-center cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Organizer Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(hasBusinessListings || hasOrganizerProfile) && <DropdownMenuSeparator />}
                  <DropdownMenuItem asChild>
                    <Link to="/my-applications" className="flex items-center cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Applications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile & Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth?tab=login">
                <Button variant={variant === "solid" ? "default" : "glass"} size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/list-business">
              <Button variant={variant === "solid" ? "default" : "hero"} size="sm">
                List Business
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden ${textStyles}`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </header>
  );
};

export default Header;