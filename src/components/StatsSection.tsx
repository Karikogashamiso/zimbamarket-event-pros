import { useEffect, useState } from "react";
import { Users, Award, MapPin, Calendar } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { Skeleton } from "@/components/ui/skeleton";

const StatsSection = () => {
  const { data: statsData, isLoading } = useStats();
  const [animatedStats, setAnimatedStats] = useState({
    providers: 0,
    events: 0,
    cities: 0,
    satisfaction: 0
  });

  // Animate numbers when data loads
  useEffect(() => {
    if (!statsData) return;

    const targets = {
      providers: statsData.totalProviders,
      events: statsData.totalEvents,
      cities: statsData.totalCities,
      satisfaction: statsData.satisfactionRate
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        providers: Math.floor(targets.providers * progress),
        events: Math.floor(targets.events * progress),
        cities: Math.floor(targets.cities * progress),
        satisfaction: Math.floor(targets.satisfaction * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targets);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [statsData]);

  const statItems = [
    {
      icon: Users,
      value: animatedStats.providers.toLocaleString(),
      label: "Trusted Providers",
      suffix: "+"
    },
    {
      icon: Calendar,
      value: animatedStats.events.toLocaleString(),
      label: "Events Planned",
      suffix: "+"
    },
    {
      icon: MapPin,
      value: animatedStats.cities,
      label: "Cities Covered",
      suffix: ""
    },
    {
      icon: Award,
      value: animatedStats.satisfaction,
      label: "Client Satisfaction",
      suffix: "%"
    }
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-10 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <div 
              key={index}
              className="text-center group hover-scale"
              style={{
                animation: `fade-in-up 0.8s ease-out ${index * 0.2}s both`
              }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 group-hover:shadow-glow-primary transition-all duration-300">
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {item.value}{item.suffix}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16 opacity-60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="w-4 h-4 text-secondary" />
            <span>Verified Businesses</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-secondary" />
            <span>Trusted by 50K+ Customers</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>Nationwide Coverage</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;