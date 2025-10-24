import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Heart, LogOut, Search, User, Shield, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import { Link, useNavigate } from "react-router-dom";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const headerStyles = variant === "solid" || isScrolled
    ? "bg-background/95 dark:bg-card/95 backdrop-blur-lg border-border shadow-lg" 
    : "bg-white/70 md:bg-white/50 backdrop-blur-xl border-white/40 md:border-white/30 shadow-lg";

  const textStyles = variant === "solid" || isScrolled
    ? "text-foreground"
    : "text-foreground md:text-white";

  const logoAccentStyles = variant === "solid" || isScrolled
    ? "text-primary"
    : "text-primary md:text-secondary";

  const searchStyles = variant === "solid" || isScrolled
    ? "bg-muted border-border text-foreground placeholder:text-muted-foreground"
    : "bg-muted md:bg-white/20 border-border md:border-white/30 text-foreground md:text-white placeholder:text-muted-foreground md:placeholder:text-white/70 focus:bg-muted md:focus:bg-white/30";

  const buttonStyles = variant === "solid" || isScrolled
    ? "hover:bg-muted"
    : "hover:bg-muted md:hover:bg-white/30";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${headerStyles} transition-all duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${textStyles} transition-colors`}>
              Zim<span className={logoAccentStyles}>EventPro</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/categories" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm xl:text-base`}>
              Browse
            </Link>
            <Link to="/events" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm xl:text-base whitespace-nowrap`}>
              Events
            </Link>
            <Link to="/organizer" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm xl:text-base`}>
              Organizer
            </Link>
            <Link to="/about" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm xl:text-base`}>
              About
            </Link>
            <Link to="/contact" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm xl:text-base`}>
              Contact
            </Link>
          </nav>
          
          {/* Desktop Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${variant === "solid" || isScrolled ? "text-muted-foreground group-focus-within:text-primary" : "text-muted-foreground md:text-white/70 group-focus-within:text-primary md:group-focus-within:text-white"}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search services, events..."
                className={`pl-10 h-10 transition-all duration-200 ${searchStyles}`}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSearch}
                  className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 ${variant === "solid" || isScrolled ? "hover:bg-muted" : "hover:bg-muted md:hover:bg-white/20"}`}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <Link to="/favorites">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${textStyles} ${buttonStyles} transition-all duration-200`}
              >
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`flex items-center gap-2 transition-all duration-200 ${variant === "solid" || isScrolled ? "text-foreground hover:bg-muted hover:text-foreground" : "text-foreground md:text-white hover:bg-muted md:hover:bg-white/30 md:hover:text-white"}`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm hidden xl:inline">
                      {user.user_metadata?.first_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-md border-border z-[100]">
                  <DropdownMenuLabel className="text-popover-foreground">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center cursor-pointer text-popover-foreground hover:text-primary">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {hasBusinessListings && (
                    <DropdownMenuItem asChild>
                      <Link to="/service-provider" className="flex items-center cursor-pointer text-popover-foreground hover:text-primary">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Service Provider</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {hasOrganizerProfile && (
                    <DropdownMenuItem asChild>
                      <Link to="/organizer" className="flex items-center cursor-pointer text-popover-foreground hover:text-primary">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Organizer Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(hasBusinessListings || hasOrganizerProfile) && <DropdownMenuSeparator />}
                  <DropdownMenuItem asChild>
                    <Link to="/my-applications" className="flex items-center cursor-pointer text-popover-foreground hover:text-primary">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Applications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer text-popover-foreground hover:text-primary">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile & Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth?tab=login">
                <Button 
                  variant={variant === "solid" || isScrolled ? "default" : "default"} 
                  size="sm" 
                  className="transition-all duration-200"
                >
                  <User className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Sign In</span>
                </Button>
              </Link>
            )}
            <Link to="/list-business">
              <Button 
                variant={variant === "solid" || isScrolled ? "default" : "hero"} 
                size="sm" 
                className="transition-all duration-200 whitespace-nowrap"
              >
                <span className="hidden lg:inline">List Business</span>
                <span className="lg:hidden">List</span>
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