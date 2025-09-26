import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Plus,
  Camera,
  Music,
  Utensils,
  Heart,
  DollarSign,
  Clock,
  Shield,
  Award,
  Globe,
  Zap
} from "lucide-react";

const ListBusiness = () => {
  // Scroll to contact form
  const scrollToForm = () => {
    const formSection = document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to benefits section
  const scrollToBenefits = () => {
    const benefitsSection = document.getElementById('benefits');
    if (benefitsSection) {
      benefitsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const benefits = [
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Reach thousands of potential customers actively searching for your services across Zimbabwe."
    },
    {
      icon: Users,
      title: "Verified Listings",
      description: "Join our network of trusted professionals with verified badges and customer reviews."
    },
    {
      icon: DollarSign,
      title: "Flexible Pricing",
      description: "Choose from our affordable subscription plans designed for businesses of all sizes."
    },
    {
      icon: Clock,
      title: "Instant Bookings",
      description: "Accept bookings 24/7 with our automated booking system and calendar management."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid safely and on time with our secure payment processing system."
    },
    {
      icon: Award,
      title: "Marketing Support",
      description: "Featured listings, promotional opportunities, and marketing tools to boost visibility."
    }
  ];

  const businessTypes = [
    { name: "Wedding Venues", icon: Building2, popular: true },
    { name: "Conference Centers", icon: Building2, popular: true },
    { name: "Catering Companies", icon: Utensils, popular: true },
    { name: "Professional DJs", icon: Music, popular: true },
    { name: "Event Photographers", icon: Camera, popular: true },
    { name: "Wedding Planners", icon: Heart, popular: false },
    { name: "Event Decorators", icon: Star, popular: false },
    { name: "Live Bands", icon: Music, popular: false },
    { name: "Bartending Services", icon: Utensils, popular: false },
    { name: "Lighting & Sound", icon: Zap, popular: false },
    { name: "Private Chefs", icon: Utensils, popular: false },
    { name: "Master of Ceremonies", icon: Users, popular: false },
    { name: "Event Security", icon: Shield, popular: false },
    { name: "Transportation", icon: Globe, popular: false }
  ];

  const stats = [
    { number: "500+", label: "Active Vendors" },
    { number: "10,000+", label: "Monthly Visitors" },
    { number: "5,000+", label: "Events Booked" },
    { number: "98%", label: "Customer Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-6 py-2 mb-6">
              <Plus className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Join Our Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
              Own an Events Business or Venue?
            </h1>
            
            <p className="text-2xl md:text-3xl text-secondary font-semibold mb-6">
              List your business on Zimbabwe's best Event Planning Platform today!
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of successful event professionals who are growing their businesses with ZimEventPro. Get discovered by thousands of customers planning their perfect events across Zimbabwe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 h-auto hover-scale" onClick={scrollToForm}>
                <Plus className="w-5 h-5 mr-2" />
                List Your Business Free
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto hover-scale" onClick={scrollToBenefits}>
                <Users className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-scale">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary">
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

      {/* Business Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Type of Business Do You Have?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              ZimEventPro welcomes all types of event-related businesses. Whether you're just starting or already established, we have the right plan for you.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {businessTypes.map((business, index) => (
              <Card key={index} className="text-center hover-scale transition-all duration-300 hover:shadow-xl cursor-pointer group">
                <CardContent className="p-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <business.icon className="w-8 h-8 text-white" />
                    </div>
                    {business.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-secondary text-white">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {business.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Don't see your business type? No problem! We welcome all event-related services.
            </p>
            <Button variant="outline" size="lg" className="hover-scale">
              <Plus className="w-5 h-5 mr-2" />
              Other Business Types
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Partner with ZimEventPro?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join Zimbabwe's fastest-growing event marketplace and take your business to the next level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover-scale transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below and our team will contact you within 24 hours to set up your business listing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Business Name</label>
                      <Input placeholder="Your Business Name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Business Type</label>
                      <Input placeholder="e.g., Wedding Venue" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input placeholder="City, Zimbabwe" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Contact Person</label>
                      <Input placeholder="Your Name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number</label>
                      <Input placeholder="+263 XX XXX XXXX" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tell us about your business</label>
                    <Textarea 
                      placeholder="Describe your services, experience, and what makes your business special..."
                      className="min-h-32"
                    />
                  </div>
                  
                  <Button className="w-full text-lg py-3 h-auto">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Application
                  </Button>
                </CardContent>
              </Card>
              
              <div className="space-y-8">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Application Review</h4>
                        <p className="text-sm text-muted-foreground">We'll review your application within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Profile Setup</h4>
                        <p className="text-sm text-muted-foreground">Our team will help you create your perfect listing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Go Live</h4>
                        <p className="text-sm text-muted-foreground">Start receiving bookings from customers</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-8 bg-gradient-to-r from-secondary to-primary text-white">
                  <h3 className="text-2xl font-bold mb-4">Special Launch Offer</h3>
                  <p className="mb-4 opacity-90">
                    Join ZimEventPro today and get your first 3 months absolutely FREE!
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">Limited time offer for new partners</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListBusiness;