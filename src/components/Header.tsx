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
    : "bg-transparent border-transparent";

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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${textStyles} transition-colors whitespace-nowrap`}>
              Zim<span className={logoAccentStyles}>EventPro</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation - Only on XL+ screens */}
          <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
            <Link to="/categories" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm 2xl:text-base`}>
              Browse
            </Link>
            <Link to="/events" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm 2xl:text-base whitespace-nowrap`}>
              Events
            </Link>
            <Link to="/organizer" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm 2xl:text-base`}>
              Organizer
            </Link>
            <Link to="/about" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm 2xl:text-base`}>
              About
            </Link>
            <Link to="/contact" className={`${textStyles} hover:text-accent transition-all duration-200 font-medium text-sm 2xl:text-base`}>
              Contact
            </Link>
          </nav>
          
          {/* Desktop Search - Only on XL+ screens */}
          <div className="hidden xl:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${variant === "solid" || isScrolled ? "text-muted-foreground group-focus-within:text-primary" : "text-muted-foreground md:text-white/70 group-focus-within:text-primary md:group-focus-within:text-white"}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search..."
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
          
          {/* Desktop Actions - Only on XL+ screens */}
          <div className="hidden xl:flex items-center space-x-2 flex-shrink-0">
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
                    size="icon"
                    className={`${textStyles} ${buttonStyles} transition-all duration-200`}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-tickets" className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {hasBusinessListings && (
                    <DropdownMenuItem asChild>
                      <Link to="/business-dashboard" className="cursor-pointer">
                        <FileText className="w-4 h-4 mr-2" />
                        Business Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {hasOrganizerProfile && (
                    <DropdownMenuItem asChild>
                      <Link to="/organizer-dashboard" className="cursor-pointer">
                        <FileText className="w-4 h-4 mr-2" />
                        Organizer Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild
                variant="ghost"
                size="icon"
                className={`${textStyles} ${buttonStyles}`}
              >
                <Link to="/auth">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button - Show on screens < XL */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`xl:hidden ${textStyles} ${buttonStyles}`}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};

export default Header;