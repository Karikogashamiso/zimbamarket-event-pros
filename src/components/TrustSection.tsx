import { Shield, Award, Users, Clock, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TrustSection = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: "Verified Vendors",
      description: "All our service providers are thoroughly vetted and background-checked for your peace of mind.",
      metric: "100% Verified"
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "We stand behind every booking with our satisfaction guarantee and 24/7 customer support.",
      metric: "98% Satisfaction"
    },
    {
      icon: Clock,
      title: "Instant Booking",
      description: "Book your perfect venue or service instantly with real-time availability and secure payments.",
      metric: "24/7 Available"
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of happy customers who've found their perfect event services through us.",
      metric: "10,000+ Events"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mukamuri",
      event: "Wedding in Harare",
      rating: 5,
      text: "ZimEventPro made our wedding planning so easy! Found the perfect venue and all our vendors in one place.",
      image: "SM"
    },
    {
      name: "David Chikwanha",
      event: "Corporate Event",
      rating: 5,
      text: "Exceptional service and quality vendors. Our company event was flawless thanks to their recommendations.",
      image: "DC"
    },
    {
      name: "Grace Mutasa",
      event: "Birthday Celebration",
      rating: 5,
      text: "Amazing experience! The catering and DJ we booked exceeded all expectations. Highly recommended!",
      image: "GM"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Trusted by Thousands</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Why Choose ZimEventPro?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're more than just a marketplace - we're your trusted partner in creating unforgettable events across Zimbabwe.
          </p>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="text-center group hover-scale">
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="bg-primary/10 rounded-full px-4 py-2 inline-block">
                  <span className="text-primary font-bold text-sm">{feature.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Customers Say
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover-scale">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.event}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Plan Your Perfect Event?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ZimEventPro for their special occasions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/categories">
              <Button variant="hero" size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3 h-auto">
                <CheckCircle className="w-5 h-5 mr-2" />
                Start Planning Now
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="glass" size="lg" className="text-lg px-8 py-3 h-auto">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;