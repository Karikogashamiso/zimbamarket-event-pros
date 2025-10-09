import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Plus,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const MyBusinessApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndFetchApplications();
  }, []);

  const checkAuthAndFetchApplications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your applications",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUser(user);
      await fetchApplications(user.id);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Not Approved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Business Applications | ZimEventPro</title>
        <meta name="description" content="View and manage your business listing applications on ZimEventPro" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Spacer */}
        <div className="h-20"></div>

        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-secondary/10 via-background to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">My Business Applications</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Track the status of your business listing applications
              </p>
            </div>
          </div>
        </section>

        {/* Applications List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {applications.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">No Applications Yet</h3>
                      <p className="text-muted-foreground mb-8">
                        You haven't submitted any business applications. Start by listing your business on our platform.
                      </p>
                      <Button size="lg" onClick={() => navigate("/list-business")}>
                        <Plus className="w-5 h-5 mr-2" />
                        List Your Business
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <Card key={app.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="w-5 h-5 text-muted-foreground" />
                              <CardTitle className="text-xl">{app.business_name}</CardTitle>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Business Type */}
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{app.business_type}</span>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground truncate">{app.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{app.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{app.location}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="pt-3 border-t">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {app.description}
                          </p>
                        </div>

                        {/* Status Info */}
                        <div className="pt-3 border-t">
                          {app.status === 'pending' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                    Under Review
                                  </p>
                                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Our team is reviewing your application. You'll receive an email notification once a decision is made (usually within 24 hours).
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {app.status === 'approved' && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                                    Application Approved! 🎉
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                    Your business listing is now active. Start managing your profile and receiving bookings.
                                  </p>
                                  <Button size="sm" onClick={() => navigate("/service-provider")}>
                                    Go to Dashboard
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {app.status === 'rejected' && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                                    Application Not Approved
                                  </p>
                                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                    Unfortunately, we couldn't approve your application at this time. You can update your information and resubmit.
                                  </p>
                                  <Button size="sm" variant="outline" onClick={() => navigate("/list-business")}>
                                    Submit New Application
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-muted-foreground pt-2 border-t">
                          Submitted {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add New Application Button */}
                  <Card className="border-dashed border-2 hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="py-12 text-center" onClick={() => navigate("/list-business")}>
                      <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg mb-2">List Another Business</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Have another venue or service? Add it to our platform.
                      </p>
                      <Button variant="outline">
                        Create New Application
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MyBusinessApplications;
