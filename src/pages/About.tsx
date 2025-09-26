import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  Users, 
  Calendar, 
  Shield, 
  Star, 
  MapPin, 
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
  Building2,
  Utensils,
  Music,
  Camera,
  TrendingUp,
  Award,
  Zap,
  Globe
} from "lucide-react";
import { useState } from "react";
import LocationsAndServices from "@/components/LocationsAndServices";

const About = () => {
  const [activeStep, setActiveStep] = useState(0);

  const features = [
    {
      icon: Shield,
      title: "100% Verified Professionals",
      description: "Every service provider is thoroughly vetted and background-checked for your peace of mind."
    },
    {
      icon: Clock,
      title: "Instant Booking",
      description: "Book your perfect venue or service instantly with real-time availability and secure payments."
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "We stand behind every booking with our satisfaction guarantee and 24/7 customer support."
    },
    {
      icon: MapPin,
      title: "Nationwide Coverage",
      description: "From Harare to Victoria Falls, we connect you with trusted professionals across Zimbabwe."
    }
  ];

  const services = [
    {
      icon: Building2,
      title: "Premium Venues",
      description: "Wedding halls, conference centers, outdoor spaces, and unique event locations",
      count: "150+"
    },
    {
      icon: Utensils,
      title: "Catering Excellence",
      description: "Professional catering services from intimate dinners to large celebrations",
      count: "80+"
    },
    {
      icon: Music,
      title: "Entertainment & DJs",
      description: "Top-rated DJs, live bands, and entertainment for unforgettable experiences",
      count: "120+"
    },
    {
      icon: Camera,
      title: "Photography & Video",
      description: "Capture every precious moment with professional photographers and videographers",
      count: "90+"
    }
  ];

  const steps = [
    {
      title: "Search & Discover",
      description: "Browse our extensive network of verified event professionals across Zimbabwe"
    },
    {
      title: "Compare & Choose",
      description: "Read reviews, compare prices, and select the perfect services for your event"
    },
    {
      title: "Book Instantly",
      description: "Secure your bookings with instant confirmation and flexible payment options"
    },
    {
      title: "Celebrate Worry-Free",
      description: "Enjoy your perfect event knowing everything is handled by trusted professionals"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "5,000+", label: "Successful Events" },
    { number: "500+", label: "Verified Vendors" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About ZimEventPro</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Simplify Your Event Planning with ZimEventPro!
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
              ZimEventPro helps you plan your perfect event — from weddings and birthdays to conferences and corporate functions. Discover and compare event venues, private chefs, photographers, décor experts and more across Zimbabwe. Browse, book, and manage everything in one place.
            </p>

            {/* Hero Image */}
            <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl hover-scale">
              <img 
                src="/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png" 
                alt="Elegant event dining setup"
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Professional Excellence</h3>
                    <p className="text-sm text-gray-600">Every detail matters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your Dedicated Online Event Planning Resource
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                ZimEventPro is your all-in-one platform for planning extraordinary events, from intimate weddings and corporate functions to birthday celebrations and cultural festivals. Find and book top <span className="text-primary font-semibold">event venues</span> for hire, book <span className="text-primary font-semibold">professional entertainers</span>, hire <span className="text-primary font-semibold">catering companies</span>, book a <span className="text-primary font-semibold">DJ</span>, and connect with all other event service providers across Zimbabwe — from Harare to Victoria Falls, Bulawayo to Mutare. Browse, book, and manage everything in one convenient place.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="italic">Take control of your event planning with</span><br />
                <span className="text-primary">ZimEventPro</span> — <span className="text-secondary">all your event companies on one platform</span>
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-scale">
                <div className="text-4xl md:text-6xl font-bold mb-2 text-secondary">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive Event Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From venues to entertainment, catering to photography — we've got everything you need for your perfect event.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover-scale transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <Badge variant="outline" className="text-primary border-primary">
                    {service.count} Providers
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How ZimEventPro Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Planning your perfect event has never been easier. Follow these simple steps to create unforgettable celebrations.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`text-center cursor-pointer transition-all duration-300 hover-scale ${
                    activeStep === index ? 'transform scale-105' : ''
                  }`}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl transition-all duration-300 ${
                    activeStep === index 
                      ? 'bg-gradient-to-br from-primary to-secondary scale-110' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className={`font-bold text-lg mb-3 transition-colors duration-300 ${
                    activeStep === index ? 'text-primary' : ''
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/10 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose ZimEventPro?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're more than just a marketplace — we're your trusted partner in creating extraordinary events across Zimbabwe.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover-scale transition-all duration-300 hover:shadow-xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations and Services */}
      <LocationsAndServices />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Plan Your Perfect Event?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust ZimEventPro for their special occasions. Start planning today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/categories">
                <Button variant="hero" size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3 h-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  Start Planning Now
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 h-auto border-white/30 text-white hover:bg-white hover:text-primary">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Browse Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;