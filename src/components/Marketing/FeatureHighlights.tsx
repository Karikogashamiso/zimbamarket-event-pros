import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, CreditCard } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const iconClasses =
  'h-6 w-6';

interface HomeFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: { text: string }[];
  display_order: number;
}

interface HomeStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string;
  display_order: number;
}

export const FeatureHighlights: React.FC = () => {
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [stats, setStats] = useState<HomeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const [featuresResult, statsResult] = await Promise.all([
        supabase
          .from('home_features')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('home_stats')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (featuresResult.data) {
        const typedFeatures = featuresResult.data.map(item => ({
          ...item,
          features: item.features as { text: string }[]
        }));
        setFeatures(typedFeatures);
      }
      if (statsResult.data) setStats(statsResult.data);
    } catch (error) {
      console.error('Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Zap;
    return Icon;
  };

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
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <Skeleton className="h-8 w-8 rounded-lg mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : features.length > 0 ? (
            features.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <Card key={feature.id} className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className={iconClasses} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">✓</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-3 text-center text-muted-foreground">No features available</p>
          )}
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
        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-border/50">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <Skeleton className="h-14 w-14 rounded-full" />
                </div>
                <Skeleton className="h-10 w-32 mx-auto mb-2" />
                <Skeleton className="h-5 w-24 mx-auto mb-1" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ))
          ) : stats.length > 0 ? (
            stats.map((stat) => {
              const IconComponent = getIconComponent(stat.icon);
              return (
                <div key={stat.id} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-base font-semibold mb-1">{stat.label}</div>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              );
            })
          ) : (
            <p className="col-span-3 text-center text-muted-foreground">No stats available</p>
          )}
        </div>
      </div>
    </div>
  );
};
