import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Heart, LogOut, Search, User } from "lucide-react";
import { useState } from "react";
import MobileMenu from "./MobileMenu";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 md:bg-white/10 backdrop-blur-md border-b border-white/30 md:border-white/20 shadow-lg md:shadow-none">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Zim<span className="text-secondary">EventPro</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/categories" className="text-white hover:text-secondary transition-colors">Browse</Link>
            <Link to="/tickets" className="text-white hover:text-secondary transition-colors">Tickets</Link>
            <Link to="/about" className="text-white hover:text-secondary transition-colors">About</Link>
            <Link to="/categories?category=services" className="text-white hover:text-secondary transition-colors">Services</Link>
            <Link to="/contact" className="text-white hover:text-secondary transition-colors">Contact</Link>
          </nav>
          
          {/* Desktop Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
              <Input
                placeholder="Search services..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      window.location.href = `/search-results?q=${encodeURIComponent(target.value.trim())}`;
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Heart className="w-5 h-5" />
            </Button>
            {user ? (
              <>
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth?tab=login">
                <Button variant="glass" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/list-business">
              <Button variant="hero" size="sm">
                List Business
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
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