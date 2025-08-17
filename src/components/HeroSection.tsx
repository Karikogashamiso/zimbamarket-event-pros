import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block">Plan.</span>
            <span className="block text-secondary">Book.</span>
            <span className="block">Celebrate.</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Zimbabwe's premier event marketplace connecting you with the best venues, caterers, DJs, and event services across the country.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input 
                  placeholder="Search venues, caterers, DJs, and more..."
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input 
                  placeholder="Location (Harare, Bulawayo, Victoria Falls...)"
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12"
                />
              </div>
              <Button variant="hero" size="lg" className="h-12 px-8">
                Find Events
              </Button>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="celebration" size="lg" className="text-lg px-8 py-3">
              Browse Venues
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white/30 text-white hover:bg-white hover:text-primary">
              List Your Business
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;