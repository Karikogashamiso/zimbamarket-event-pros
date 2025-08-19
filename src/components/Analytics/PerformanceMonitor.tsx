import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Clock, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { measureWebVitals } from '@/utils/performance';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  threshold: { good: number; poor: number };
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const initializeMetrics = () => {
    setIsLoading(true);
    const collectedMetrics: Metric[] = [];

    measureWebVitals((metric) => {
      const metricData: Metric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        unit: getMetricUnit(metric.name),
        threshold: getMetricThreshold(metric.name),
      };

      collectedMetrics.push(metricData);
      setMetrics([...collectedMetrics]);
    });

    // Simulate completion after collecting initial metrics
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 2000);
  };

  const getMetricUnit = (name: string): string => {
    switch (name) {
      case 'LCP':
      case 'FID':
      case 'FCP':
      case 'TTFB':
        return 'ms';
      case 'CLS':
        return '';
      default:
        return '';
    }
  };

  const getMetricThreshold = (name: string) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };
    return thresholds[name as keyof typeof thresholds] || { good: 0, poor: 100 };
  };

  const getMetricIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') {
      return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`;
    }
    if (unit === '') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}${unit}`;
  };

  useEffect(() => {
    initializeMetrics();
  }, []);

  const overallScore = metrics.length > 0 
    ? Math.round((metrics.filter(m => m.rating === 'good').length / metrics.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Real-time Core Web Vitals tracking</p>
        </div>
        <Button 
          onClick={initializeMetrics} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Performance Score</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">
                  {isLoading ? '...' : `${overallScore}%`}
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    overallScore >= 80 ? 'border-green-500 text-green-700' :
                    overallScore >= 60 ? 'border-yellow-500 text-yellow-700' :
                    'border-red-500 text-red-700'
                  }
                >
                  {overallScore >= 80 ? 'Excellent' : 
                   overallScore >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.map((metric) => (
            <Card key={metric.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">{metric.name}</h4>
                  {getMetricIcon(metric.rating)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={getMetricColor(metric.rating)}
                  >
                    {metric.rating.replace('-', ' ')}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    Good: ≤ {formatValue(metric.threshold.good, metric.unit)} • 
                    Poor: &gt; {formatValue(metric.threshold.poor, metric.unit)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recommendations */}
      {metrics.some(m => m.rating !== 'good') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance Recommendations:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {metrics.filter(m => m.rating === 'poor').map(metric => (
                <li key={metric.name}>
                  • Improve {metric.name}: Consider optimizing {
                    metric.name === 'LCP' ? 'largest content element loading' :
                    metric.name === 'FID' ? 'JavaScript execution time' :
                    metric.name === 'CLS' ? 'layout stability' :
                    'loading performance'
                  }
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(performance.now())}ms
              </div>
              <div className="text-sm text-muted-foreground">Page Load Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {navigator.connection ? `${(navigator.connection as any).downlink}Mbps` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Connection Speed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || 'N/A'}MB
              </div>
              <div className="text-sm text-muted-foreground">Memory Usage</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {navigator.hardwareConcurrency || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">CPU Cores</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;