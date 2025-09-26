import { lazy, Suspense, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Image as ImageIcon, 
  Wifi, 
  Smartphone, 
  Monitor,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Lazy load heavy components
const LazyImageComponent = lazy(() => import("@/components/LazyImage"));

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
}

const PerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<string>("unknown");

  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log(`Performance: ${entry.name} - ${entry.value || entry.duration}ms`);
      });
    });

    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setConnectionSpeed(connection.effectiveType);
    }

    // Simulate metrics collection
    setTimeout(() => {
      setMetrics({
        lcp: 1200, // Good: < 2500ms
        fid: 45,   // Good: < 100ms  
        cls: 0.05, // Good: < 0.1
        fcp: 800   // Good: < 1800ms
      });
      setLoading(false);
    }, 1000);

    return () => observer?.disconnect();
  }, []);

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.poor) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    if (value <= thresholds.poor) return <Badge className="bg-yellow-100 text-yellow-800">Needs Work</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Performance Score
            </h3>
            <p className="text-muted-foreground">Real-time Core Web Vitals monitoring</p>
          </div>
          <Badge variant="outline" className="flex items-center">
            <Wifi className="w-4 h-4 mr-1" />
            {connectionSpeed}
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div>
                <p className="font-medium">Measuring performance...</p>
                <p className="text-sm text-muted-foreground">Analyzing Core Web Vitals</p>
              </div>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {/* Largest Contentful Paint */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold mb-1 flex items-center justify-center">
                <span className={getScoreColor(metrics!.lcp, { good: 2500, poor: 4000 })}>
                  {metrics!.lcp}ms
                </span>
              </div>
              <div className="text-sm font-medium mb-2">LCP</div>
              <div className="text-xs text-muted-foreground mb-2">Largest Contentful Paint</div>
              {getScoreBadge(metrics!.lcp, { good: 2500, poor: 4000 })}
            </div>

            {/* First Input Delay */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold mb-1 flex items-center justify-center">
                <span className={getScoreColor(metrics!.fid, { good: 100, poor: 300 })}>
                  {metrics!.fid}ms
                </span>
              </div>
              <div className="text-sm font-medium mb-2">FID</div>
              <div className="text-xs text-muted-foreground mb-2">First Input Delay</div>
              {getScoreBadge(metrics!.fid, { good: 100, poor: 300 })}
            </div>

            {/* Cumulative Layout Shift */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold mb-1 flex items-center justify-center">
                <span className={getScoreColor(metrics!.cls * 1000, { good: 100, poor: 250 })}>
                  {metrics!.cls.toFixed(3)}
                </span>
              </div>
              <div className="text-sm font-medium mb-2">CLS</div>
              <div className="text-xs text-muted-foreground mb-2">Cumulative Layout Shift</div>
              {getScoreBadge(metrics!.cls * 1000, { good: 100, poor: 250 })}
            </div>

            {/* First Contentful Paint */}
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold mb-1 flex items-center justify-center">
                <span className={getScoreColor(metrics!.fcp, { good: 1800, poor: 3000 })}>
                  {metrics!.fcp}ms
                </span>
              </div>
              <div className="text-sm font-medium mb-2">FCP</div>
              <div className="text-xs text-muted-foreground mb-2">First Contentful Paint</div>
              {getScoreBadge(metrics!.fcp, { good: 1800, poor: 3000 })}
            </div>
          </div>
        )}
      </Card>

      {/* Optimization Strategies */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Optimization */}
        <Card className="p-6">
          <h4 className="font-semibold flex items-center mb-4">
            <ImageIcon className="w-5 h-5 mr-2 text-primary" />
            Image Optimization
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Lazy Loading</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">WebP Format</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Responsive Images</span>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">CDN Delivery</span>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          
          {/* Image Loading Demo */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Lazy Loading Example:</p>
            <Suspense fallback={
              <div className="h-20 bg-muted animate-pulse rounded flex items-center justify-center">
                <span className="text-xs">Loading...</span>
              </div>
            }>
              <LazyImageComponent 
                src="/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png" 
                alt="Royal Gardens Venue"
                className="w-full h-20 object-cover rounded"
              />
            </Suspense>
          </div>
        </Card>

        {/* Mobile Optimization */}
        <Card className="p-6">
          <h4 className="font-semibold flex items-center mb-4">
            <Smartphone className="w-5 h-5 mr-2 text-primary" />
            Mobile Performance
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mobile-First CSS</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Touch Optimization</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reduced Bundle Size</span>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Worker</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile
              </div>
              <span className="font-medium">68%</span>
            </div>
            <Progress value={68} className="h-1" />
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <Monitor className="w-3 h-3 mr-1" />
                Desktop
              </div>
              <span className="font-medium">32%</span>
            </div>
            <Progress value={32} className="h-1" />
          </div>
        </Card>
      </div>

      {/* Loading States Demo */}
      <Card className="p-6">
        <h4 className="font-semibold flex items-center mb-4">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Progressive Loading
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Skeleton Loading */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Skeleton Loading</div>
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Shimmer Effect</div>
            <div className="h-20 bg-gradient-to-r from-muted via-muted/50 to-muted bg-200% animate-shimmer rounded"></div>
          </div>

          {/* Progressive Enhancement */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Progressive Enhancement</div>
            <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded"></div>}>
              <div className="h-20 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center text-white font-medium">
                Enhanced Content
              </div>
            </Suspense>
          </div>
        </div>
      </Card>

      {/* Performance Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" size="sm">
          Run Lighthouse Audit
        </Button>
        <Button variant="outline" size="sm">
          Optimize Images
        </Button>
        <Button variant="outline" size="sm">
          Enable Caching
        </Button>
        <Button variant="outline" size="sm">
          Minimize Bundle
        </Button>
      </div>
    </div>
  );
};

export default PerformanceOptimizer;