import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  Gift, 
  Clock, 
  CheckCircle,
  Smartphone,
  Globe
} from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            🎉 Limited Time: Launch Special
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Book Your Next Adventure?
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of Zimbabweans who've discovered the easiest way to book 
            tickets for concerts, clubs, buses, and flights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold bg-white text-primary hover:bg-white/90"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Booking Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg border-white text-white hover:bg-white/10"
            >
              <Gift className="mr-2 h-5 w-5" />
              List Your Event Free
            </Button>
          </div>

          {/* Urgency Elements */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Get started in under 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>No setup fees or hidden charges</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Works on any device</span>
            </div>
          </div>
        </div>

        {/* Feature Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Bookings</h3>
              <p className="text-sm opacity-90">
                Book tickets in seconds, not minutes. Our lightning-fast checkout process gets you confirmed instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Always Available</h3>
              <p className="text-sm opacity-90">
                24/7 access from anywhere in Zimbabwe. Book even when the power's out with our offline-ready system.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">100% Secure</h3>
              <p className="text-sm opacity-90">
                Bank-grade security with fraud protection. Your payments and data are always safe with us.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const BusinessCTA: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-accent via-accent/90 to-accent/80">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-accent-foreground/20">
            For Event Organizers & Businesses
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-accent-foreground">
            Sell More Tickets, Stress Less
          </h2>
          
          <p className="text-xl mb-8 text-accent-foreground/80">
            Whether you're running concerts in Harare, bus routes to Victoria Falls, 
            or exclusive club nights — we'll help you reach more customers and increase sales.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-left">
              <h3 className="font-bold text-lg mb-4 text-accent-foreground">Event Organizers Get:</h3>
              <div className="space-y-2">
                {[
                  "Real-time sales dashboard",
                  "Instant EcoCash payouts", 
                  "Fraud protection included",
                  "Mobile-optimized booking pages",
                  "WhatsApp ticket delivery",
                  "24/7 customer support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-accent-foreground/90">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-left">
              <h3 className="font-bold text-lg mb-4 text-accent-foreground">Transport Operators Get:</h3>
              <div className="space-y-2">
                {[
                  "Route & schedule management",
                  "Seat reservation system",
                  "Real-time occupancy tracking",
                  "Digital check-in process",
                  "Revenue analytics",
                  "Integration with existing systems"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-accent-foreground/90">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold mb-1 text-accent-foreground">0%</div>
                <div className="text-sm text-accent-foreground/80">Setup Fees</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1 text-accent-foreground">2.9%</div>
                <div className="text-sm text-accent-foreground/80">Transaction Fee</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1 text-accent-foreground">24hr</div>
                <div className="text-sm text-accent-foreground/80">Payout Time</div>
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="px-8 py-4 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            List Your Event For Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-accent-foreground/70 mt-4">
            No monthly fees • No contracts • Start selling in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
};