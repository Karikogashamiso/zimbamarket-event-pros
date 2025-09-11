import React from 'react';
import { LandingPageHero } from '@/components/Marketing/LandingPageHero';
import { FeatureHighlights } from '@/components/Marketing/FeatureHighlights';
import { TestimonialsSection } from '@/components/Marketing/TestimonialsSection';
import { CTASection, BusinessCTA } from '@/components/Marketing/CTASection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Clock,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';

export default function MarketingLanding() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <LandingPageHero />

      {/* Problem/Solution Section */}
      <div className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div>
              <Badge variant="destructive" className="mb-4">
                The Old Way is Broken
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Tired of Booking Nightmares?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm">✗</span>
                  </div>
                  <div>
                    <div className="font-medium">Long queues at bus stations</div>
                    <div className="text-sm text-muted-foreground">Wasting hours just to buy a ticket</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm">✗</span>
                  </div>
                  <div>
                    <div className="font-medium">Sold out concerts you never heard about</div>
                    <div className="text-sm text-muted-foreground">Missing your favorite artists because tickets disappeared</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm">✗</span>
                  </div>
                  <div>
                    <div className="font-medium">Unsafe payment methods</div>
                    <div className="text-sm text-muted-foreground">Sending cash with strangers or unreliable platforms</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm">✗</span>
                  </div>
                  <div>
                    <div className="font-medium">No seat guarantees</div>
                    <div className="text-sm text-muted-foreground">Arriving to find your "reserved" table is taken</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div>
              <Badge className="mb-4">
                The ZimEventPro Way
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Book Smarter, Not Harder
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Book from anywhere, anytime</div>
                    <div className="text-sm text-muted-foreground">Home, office, or on the go - your tickets are just clicks away</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Never miss out again</div>
                    <div className="text-sm text-muted-foreground">Instant notifications when your favorite events go on sale</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Secure EcoCash & OneMoney</div>
                    <div className="text-sm text-muted-foreground">Pay safely with your preferred mobile money platform</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Guaranteed entry with QR codes</div>
                    <div className="text-sm text-muted-foreground">No more arguments at the door - your digital ticket is your proof</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <FeatureHighlights />

      {/* How It Works */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How ZimEventPro Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to secure your spot at Zimbabwe's best events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-2xl font-bold text-primary">1</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center">
                  ✓
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">Browse & Select</h3>
              <p className="text-muted-foreground mb-4">
                Find concerts, club events, bus routes, or flights. Filter by date, location, and price.
              </p>
              <div className="text-sm text-primary font-medium">
                Over 1,000 events available monthly
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-2xl font-bold text-primary">2</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center">
                  ✓
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">Book & Pay</h3>
              <p className="text-muted-foreground mb-4">
                Choose your seats, add extras, and pay securely with EcoCash, OneMoney, or card.
              </p>
              <div className="text-sm text-primary font-medium">
                Average checkout time: 28 seconds
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-2xl font-bold text-primary">3</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center">
                  ✓
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">Enjoy & Enter</h3>
              <p className="text-muted-foreground mb-4">
                Get your tickets via WhatsApp or email. Show your QR code and walk right in.
              </p>
              <div className="text-sm text-primary font-medium">
                Skip all queues with digital entry
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Zimbabwe-Specific Benefits */}
      <div className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              🇿🇼 Made for Zimbabwe
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built for Our Unique Challenges
            </h2>
            <p className="text-xl text-muted-foreground">
              We understand Zimbabwe's infrastructure and have solutions that actually work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Works Offline</h3>
                <p className="text-sm text-muted-foreground">
                  Tickets validate even when internet is down
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Mobile Money</h3>
                <p className="text-sm text-muted-foreground">
                  EcoCash & OneMoney integration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Load Shedding Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Works during power outages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Fraud Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced security for your peace of mind
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Business CTA */}
      <BusinessCTA />

      {/* Final CTA */}
      <CTASection />

      {/* Footer Content */}
      <div className="py-8 bg-muted text-center">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground mb-4">
            Join thousands of Zimbabweans who've made the switch to smarter booking
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span>🇿🇼 Proudly Zimbabwean</span>
            <span>🔒 256-bit SSL Security</span>
            <span>📱 Mobile Optimized</span>
            <span>⚡ 99.9% Uptime</span>
            <span>🎯 24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}