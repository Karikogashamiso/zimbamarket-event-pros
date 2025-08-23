import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Heart, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingActionButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
        setShowScrollTop(window.pageYOffset > 600);
      } else {
        setIsVisible(false);
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col gap-3 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Help Chat Button */}
        <Button
          variant="premium"
          size="icon"
          className="w-14 h-14 rounded-full shadow-2xl hover:shadow-glow-primary animate-float"
          title="Get Help"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        {/* Call Button */}
        <Button
          variant="secondary"
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg hover:shadow-celebration"
          title="Call Us"
        >
          <Phone className="w-5 h-5" />
        </Button>

        {/* Favorites Button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-accent/90"
          title="Favorites"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full shadow-lg bg-white/90 backdrop-blur-sm transition-all duration-300",
            "hover:shadow-xl hover:-translate-y-1"
          )}
          title="Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </>
  );
};

export default FloatingActionButton;