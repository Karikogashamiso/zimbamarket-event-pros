import { Button } from "@/components/ui/button";
import { Menu, Heart, User } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Zim<span className="text-secondary">EventPro</span>
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-secondary transition-colors">Browse</a>
            <a href="#" className="text-white hover:text-secondary transition-colors">Venues</a>
            <a href="#" className="text-white hover:text-secondary transition-colors">Services</a>
            <a href="/contact" className="text-white hover:text-secondary transition-colors">Contact</a>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              List Business
            </Button>
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
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-white/20 p-4">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-gray-800 hover:text-primary transition-colors">Browse</a>
              <a href="#" className="text-gray-800 hover:text-primary transition-colors">Venues</a>
              <a href="#" className="text-gray-800 hover:text-primary transition-colors">Services</a>
              <a href="/contact" className="text-gray-800 hover:text-primary transition-colors">Contact</a>
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Button variant="outline" className="flex-1">Sign In</Button>
                <Button variant="default" className="flex-1">List Business</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;