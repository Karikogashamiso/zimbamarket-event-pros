import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Store, TrendingUp, Calendar, AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { ServicesList } from "@/components/ServicesList";
import { BusinessListingsDisplay } from "@/components/BusinessListingsDisplay";
import { BookingRequestsManager } from "@/components/BookingRequestsManager";
import { BusinessApplicationsManager } from "@/components/Admin/BusinessApplicationsManager";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { useInventoryManagement } from "@/hooks/useInventoryManagement";

const ServiceProviderDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessListings, setBusinessListings] = useState<any[]>([]);
  const [hasApprovedListings, setHasApprovedListings] = useState(false);
  
  // Analytics and metrics
  const { metrics } = useAnalytics();
  const { pricingModels } = useDynamicPricing();
  const { conflicts } = useInventoryManagement();
  
  // Calculate totals from metrics
  const totalViews = metrics.reduce((sum, m) => sum + m.total_views, 0);
  const totalBookings = metrics.reduce((sum, m) => sum + m.total_bookings, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + (m.total_conversions * 100), 0); // Estimate

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the service provider dashboard.",
        variant: "destructive",
      });
      navigate('/auth?tab=login');
      return;
    }
    
    checkBusinessListings();
  }, [user, authLoading]);

  const checkBusinessListings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBusinessListings(data || []);
      const approved = data?.some(listing => listing.status === 'approved');
      setHasApprovedListings(approved);

      if (!data || data.length === 0) {
        toast({
          title: "No Business Listings Found",
          description: "You need to apply for a business listing first.",
        });
        navigate('/list-business');
        return;
      }
    } catch (error: any) {
      console.error('Error checking business listings:', error);
      toast({
        title: "Error",
        description: "Failed to load business listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Service Provider Dashboard | ZimEventPro</title>
      </Helmet>

      <div className="h-20"></div>

      <section className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">Service Provider Dashboard</h1>
              <p className="text-xl text-white/90">
                Manage your business listings and services
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/list-business')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all services
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirmed bookings
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Listings</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessListings.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {businessListings.filter(b => b.status === 'approved').length} approved
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="services" disabled={!hasApprovedListings}>
                Services {!hasApprovedListings && "(Locked)"}
              </TabsTrigger>
              <TabsTrigger value="requests">Enquiries</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Dynamic Pricing Models</CardTitle>
                    <CardDescription>
                      Active pricing strategies for your services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pricingModels.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No dynamic pricing models configured yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pricingModels.slice(0, 3).map((model: any) => (
                          <div key={model.id} className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm font-medium">Service #{model.service_id.slice(0, 8)}</span>
                            <span className="text-sm text-muted-foreground">
                              {model.dynamic_pricing_enabled ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={conflicts.length > 0 ? "border-orange-500" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className={conflicts.length > 0 ? "text-orange-500" : "text-muted-foreground"} />
                      Inventory Conflicts
                    </CardTitle>
                    <CardDescription>
                      Booking conflicts requiring attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {conflicts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No conflicts detected
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {conflicts.slice(0, 3).map((conflict: any) => (
                          <div key={conflict.id} className="p-2 border border-orange-200 bg-orange-50 rounded">
                            <p className="text-sm font-medium">{conflict.conflict_type}</p>
                            <p className="text-xs text-muted-foreground">{conflict.conflict_date}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Business Applications</CardTitle>
                  <CardDescription>
                    Track the status of your business listing applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessApplicationsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Business Listings</CardTitle>
                  <CardDescription>
                    Manage your registered businesses on ZimEventPro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessListingsDisplay userId={user?.id || ''} />
                </CardContent>
              </Card>

              {businessListings.some(b => b.status === 'pending') && (
                <Card className="border-yellow-500">
                  <CardHeader>
                    <CardTitle className="text-yellow-700">Pending Approval</CardTitle>
                    <CardDescription>
                      Your business listing is under review. You'll be notified once it's approved.
                      After approval, you can create services for your business.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Your Services</h2>
                  <p className="text-muted-foreground">Manage all services across your business listings</p>
                </div>
                {hasApprovedListings && (
                  <Button onClick={() => navigate('/service-provider/create-service')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Service
                  </Button>
                )}
              </div>
              
              {!hasApprovedListings ? (
                <Card className="border-yellow-500">
                  <CardHeader>
                    <CardTitle>Services Locked</CardTitle>
                    <CardDescription>
                      You need at least one approved business listing before you can create services.
                      Please wait for your business application to be approved.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <ServicesList />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Enquiries</CardTitle>
                  <CardDescription>
                    Manage inquiries and booking requests for your services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingRequestsManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ServiceProviderDashboard;
