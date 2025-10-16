import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Plus, Users, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";

const BusinessCTASection = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <Card className="max-w-5xl mx-auto overflow-hidden shadow-2xl">
          <CardContent className="p-6 sm:p-8 md:p-12 lg:p-16 text-center bg-gradient-to-br from-white via-white to-secondary/5">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 text-secondary">
                Own an Events Business or Venue?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium mb-6 md:mb-8">
                List your business on Zimbabwe's best Event Planning Platform today!
              </p>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
                Join hundreds of successful event professionals who are growing their businesses with ZimEventPro. Get discovered by thousands of customers planning their perfect events.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-6 md:mb-8">
              <Link to="/list-business">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 h-auto bg-secondary hover:bg-secondary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-scale w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  List My Business
                </Button>
              </Link>
              
              <Link to="/about">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 h-auto border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-full transition-all duration-300 hover-scale group w-full sm:w-auto"
                >
                  Learn more
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-secondary/20">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-secondary">500+</div>
                  <div className="text-sm text-muted-foreground">Active Partners</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-secondary">10,000+</div>
                  <div className="text-sm text-muted-foreground">Monthly Visitors</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-secondary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BusinessCTASection;