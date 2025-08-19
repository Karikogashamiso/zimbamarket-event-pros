import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Calendar,
  Globe
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDynamicPricing } from '@/hooks/useDynamicPricing';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

const BusinessDashboard = () => {
  const { metrics, loading: analyticsLoading } = useAnalytics();
  const { pricingModels } = useDynamicPricing();
  const { conflicts } = useInventoryManagement();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" />
            EN | SN | ND
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.reduce((sum, m) => sum + m.total_views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.reduce((sum, m) => sum + m.total_bookings, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+8% conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">Dynamic pricing active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.slice(0, 5).map((metric) => (
              <div key={metric.service_id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{metric.service_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {metric.total_views} views • {metric.booking_conversion_rate}% conversion
                  </p>
                </div>
                <Badge variant={metric.booking_conversion_rate > 15 ? "default" : "secondary"}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.booking_conversion_rate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conflicts & Inventory */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Booking Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.slice(0, 3).map((conflict) => (
                <div key={conflict.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{conflict.description}</p>
                    <p className="text-sm text-muted-foreground">{conflict.conflict_date}</p>
                  </div>
                  <Badge variant={conflict.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {conflict.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessDashboard;