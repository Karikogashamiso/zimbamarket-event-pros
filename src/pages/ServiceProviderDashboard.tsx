import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { ServiceCreationForm } from "@/components/ServiceCreationForm";
import { BusinessListingsDisplay } from "@/components/BusinessListingsDisplay";
import { BookingRequestsManager } from "@/components/BookingRequestsManager";

const ServiceProviderDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessListings, setBusinessListings] = useState<any[]>([]);
  const [hasApprovedListings, setHasApprovedListings] = useState(false);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings">Business Listings</TabsTrigger>
              <TabsTrigger value="services" disabled={!hasApprovedListings}>
                Services {!hasApprovedListings && "(Locked)"}
              </TabsTrigger>
              <TabsTrigger value="requests">Booking Requests</TabsTrigger>
            </TabsList>

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
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Service</CardTitle>
                      <CardDescription>
                        Add a new service to one of your approved business listings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ServiceCreationForm />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Services</CardTitle>
                      <CardDescription>
                        Services are displayed below the form after creation
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Requests</CardTitle>
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
