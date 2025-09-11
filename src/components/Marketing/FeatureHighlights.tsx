import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  CreditCard, 
  Clock,
  QrCode,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  return (
    <div className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Why Choose ZimEventPro?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            The Smartest Way to Book in Zimbabwe
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built specifically for Zimbabwe's unique needs — from mobile money integration 
            to offline capabilities that work even when the lights go out.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Feature 1: Instant & Secure */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">Lightning Fast Booking</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-6 text-center">
                Book tickets in under 30 seconds with our streamlined checkout process
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">One-click repeat bookings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Auto-fill customer details</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Instant email & SMS confirmation</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average booking time:</span>
                  <span className="font-bold text-primary">28 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2: Security */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl">Bank-Grade Security</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-6 text-center">
                Your payments and personal data are protected by military-grade encryption
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <QrCode className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Anti-fraud QR codes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">SSL encryption everywhere</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Secure payment processing</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">99.99% fraud-free transactions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Mobile-First */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl">Made for Mobile</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-6 text-center">
                Designed for Zimbabwe's mobile-first culture — works perfectly on any device
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">WhatsApp ticket delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Works offline when needed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Zero app downloads required</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">Optimized for 2G networks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Pay Your Way</CardTitle>
            <p className="text-muted-foreground">
              Supporting all major payment methods in Zimbabwe
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold mb-1">EcoCash</h4>
                <p className="text-xs text-muted-foreground">Instant mobile payments</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-1">OneMoney</h4>
                <p className="text-xs text-muted-foreground">NetOne mobile money</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-1">Visa/Mastercard</h4>
                <p className="text-xs text-muted-foreground">International cards</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-1">Bank Transfer</h4>
                <p className="text-xs text-muted-foreground">Direct bank payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1M+</div>
            <div className="text-lg font-semibold mb-1">Tickets Sold</div>
            <div className="text-sm text-muted-foreground">Trusted by thousands daily</div>
          </div>
          
          <div>
            <div className="text-4xl font-bold text-primary mb-2">50K+</div>
            <div className="text-lg font-semibold mb-1">Happy Customers</div>
            <div className="text-sm text-muted-foreground">Across all major cities</div>
          </div>
          
          <div>
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-lg font-semibold mb-1">Uptime</div>
            <div className="text-sm text-muted-foreground">Always available when you need us</div>
          </div>
        </div>
      </div>
    </div>
  );
};