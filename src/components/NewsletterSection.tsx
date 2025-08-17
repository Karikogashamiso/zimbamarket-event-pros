import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Gift, Bell, Users } from "lucide-react";
import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const benefits = [
    {
      icon: Gift,
      title: "Exclusive Deals",
      description: "Get first access to special offers and discounts"
    },
    {
      icon: Bell,
      title: "Event Tips",
      description: "Weekly planning tips and inspiration delivered to your inbox"
    },
    {
      icon: Users,
      title: "New Vendors",
      description: "Be the first to discover amazing new service providers"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/20 rounded-full px-6 py-2 mb-6">
              <Mail className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Stay Connected</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
              Never Miss an Update
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join our community of event enthusiasts and get the latest tips, deals, and inspiration delivered straight to your inbox.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center hover-scale">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Newsletter Form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 border border-border shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Get Exclusive Event Planning Tips & Deals
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 text-lg bg-background border-border focus:border-primary"
                  />
                </div>
                <Button 
                  variant="default" 
                  size="lg" 
                  className="h-14 px-8 text-lg font-semibold hover-scale"
                >
                  Subscribe Now
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                We respect your privacy. Unsubscribe at any time. 
                <span className="text-primary"> No spam, we promise!</span>
              </p>
              
              {/* Social Proof */}
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>5,000+ subscribers</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Weekly updates</span>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>No spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;