import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Calendar,
  Globe,
  FileText,
  Building2,
  MessageSquare
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDynamicPricing } from '@/hooks/useDynamicPricing';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { BusinessApplicationsManager } from '@/components/Admin/BusinessApplicationsManager';
import { BusinessListingsManager } from '@/components/Admin/BusinessListingsManager';
import { BookingRequestsManager } from '@/components/BookingRequestsManager';
import { ServicesList } from '@/components/ServicesList';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const BusinessDashboard = () => {
  const { metrics, loading: analyticsLoading } = useAnalytics();
  const { pricingModels } = useDynamicPricing();
  const { conflicts } = useInventoryManagement();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" />
            EN | SN | ND
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6 mt-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications">
            <FileText className="w-4 h-4 mr-2" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Building2 className="w-4 h-4 mr-2" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="services">
            <DollarSign className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="enquiries">
            <MessageSquare className="w-4 h-4 mr-2" />
            Enquiries
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {metric.total_bookings} bookings
                      </Badge>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Conflicts */}
          {conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Booking Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conflicts.map((conflict) => (
                    <div 
                      key={conflict.id} 
                      className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            {conflict.conflict_type}
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {conflict.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conflict.conflict_date} • {conflict.severity} severity
                          </p>
                        </div>
                        <Badge 
                          variant={conflict.resolved ? "outline" : "destructive"}
                          className={conflict.resolved ? "bg-green-50" : ""}
                        >
                          {conflict.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dynamic Pricing Models */}
          {pricingModels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Pricing Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pricingModels.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Base Price: ${model.base_price}</p>
                        <p className="text-sm text-muted-foreground">
                          Peak: {model.peak_multiplier}x • Off-Peak: {model.off_peak_multiplier}x
                        </p>
                      </div>
                      <Badge 
                        variant={model.dynamic_pricing_enabled ? "default" : "outline"}
                      >
                        {model.dynamic_pricing_enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <BusinessApplicationsManager />
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <BusinessListingsManager />
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Services</CardTitle>
                  <CardDescription>
                    Manage services for your approved business listings
                  </CardDescription>
                </div>
                <Button onClick={() => navigate('/service-provider/create-service')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ServicesList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enquiries Tab */}
        <TabsContent value="enquiries">
          <BookingRequestsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessDashboard;