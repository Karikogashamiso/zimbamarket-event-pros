import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");


  const popularSearches = ["Wedding Venues", "Corporate Events", "Birthday Parties", "DJs", "Catering"];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Enhanced Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-10000 ease-out"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/60 to-primary/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-secondary/20 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute top-40 right-20 text-secondary/30 animate-pulse delay-1000">
        <Star className="w-6 h-6" />
      </div>
      <div className="absolute bottom-40 left-20 text-secondary/20 animate-pulse delay-2000">
        <Calendar className="w-10 h-10" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-secondary/30 animate-fade-in">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Zimbabwe's #1 Event Marketplace</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight animate-fade-in">
            <span className="block opacity-0 animate-[fade-in_1s_ease-out_0.2s_forwards]">Find & Book</span>
            <span className="block text-secondary opacity-0 animate-[fade-in_1s_ease-out_0.4s_forwards]">Trusted Event</span>
            <span className="block opacity-0 animate-[fade-in_1s_ease-out_0.6s_forwards]">Services</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto opacity-0 animate-[fade-in_1s_ease-out_0.8s_forwards]">
            From intimate gatherings to grand celebrations, discover Zimbabwe's finest venues, caterers, photographers, and event professionals all in one place.
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/30 shadow-2xl opacity-0 animate-[fade-in_1s_ease-out_1s_forwards] hover-scale">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try 'Wedding Venue in Harare' or 'DJ Services'"
                  className="pl-12 bg-transparent border-0 text-gray-800 placeholder:text-gray-500 h-14 text-lg focus:ring-0 focus:border-0"
                />
              </div>
              <div className="flex-1 relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <Input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Harare, Bulawayo, Victoria Falls..."
                  className="pl-12 bg-transparent border-0 text-gray-800 placeholder:text-gray-500 h-14 text-lg focus:ring-0 focus:border-0"
                />
              </div>
              <Button variant="hero" size="lg" className="h-14 px-10 text-lg font-semibold hover-scale">
                <Search className="w-5 h-5 mr-2" />
                Search Now
              </Button>
            </div>
            
            {/* Popular Searches */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-sm text-gray-600 mr-2">Popular:</span>
              {popularSearches.map((search, index) => (
                <button 
                  key={index}
                  className="text-sm bg-gray-100 hover:bg-primary hover:text-white text-gray-700 px-3 py-1 rounded-full transition-all duration-200 hover-scale"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 opacity-0 animate-[fade-in_1s_ease-out_1.2s_forwards]">
            <Button variant="celebration" size="lg" className="text-lg px-10 py-4 h-auto hover-scale">
              <Calendar className="w-5 h-5 mr-2" />
              Browse All Services
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-10 py-4 h-auto border-white/40 text-white hover:bg-white hover:text-primary hover-scale">
              <TrendingUp className="w-5 h-5 mr-2" />
              List Your Business
            </Button>
          </div>
          
        </div>
      </div>
      
      {/* Enhanced Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center hover:border-secondary transition-colors cursor-pointer">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
        <p className="text-xs mt-2 opacity-70">Scroll to explore</p>
      </div>
    </section>
  );
};

export default HeroSection;