import { Button } from "@/components/ui/button";
import { Menu, Heart } from "lucide-react";
import { useState } from "react";
import AuthDialog from "./AuthDialog";
import MobileMenu from "./MobileMenu";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
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
            <Link to="/about" className="text-white hover:text-secondary transition-colors">About</Link>
            <Link to="/categories?category=services" className="text-white hover:text-secondary transition-colors">Services</Link>
            <Link to="/contact" className="text-white hover:text-secondary transition-colors">Contact</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Heart className="w-5 h-5" />
            </Button>
            <AuthDialog>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Sign In
              </Button>
            </AuthDialog>
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