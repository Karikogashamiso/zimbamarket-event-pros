import { Button } from "@/components/ui/button";
import { Menu, Heart, LogOut } from "lucide-react";
import { useState } from "react";
import AuthDialog from "./AuthDialog";
import MobileMenu from "./MobileMenu";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

const Header = ({ variant = "transparent" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isSolid = variant === "solid";

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
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className={`${isSolid ? "sticky top-0 z-50 bg-white border-b border-gray-200" : "absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className={`text-2xl md:text-3xl font-bold ${isSolid ? "text-foreground" : "text-white"}`}>
              Zim<span className="text-secondary">EventPro</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/categories" className={`${isSolid ? "text-foreground" : "text-white"} hover:text-secondary transition-colors`}>Browse</Link>
            <Link to="/tickets" className={`${isSolid ? "text-foreground" : "text-white"} hover:text-secondary transition-colors`}>Tickets</Link>
            <Link to="/about" className={`${isSolid ? "text-foreground" : "text-white"} hover:text-secondary transition-colors`}>About</Link>
            <Link to="/categories?category=services" className={`${isSolid ? "text-foreground" : "text-white"} hover:text-secondary transition-colors`}>Services</Link>
            <Link to="/contact" className={`${isSolid ? "text-foreground" : "text-white"} hover:text-secondary transition-colors`}>Contact</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className={`${isSolid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`}>
              <Heart className="w-5 h-5" />
            </Button>
            {user ? (
              <>
                <span className={`${isSolid ? "text-foreground" : "text-white"} text-sm`}>
                  Welcome, {user.user_metadata?.first_name || user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`${isSolid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`}
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <AuthDialog>
                <Button variant="ghost" className={`${isSolid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`}>
                  Sign In
                </Button>
              </AuthDialog>
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
            className={`md:hidden ${isSolid ? "text-foreground" : "text-white"}`}
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