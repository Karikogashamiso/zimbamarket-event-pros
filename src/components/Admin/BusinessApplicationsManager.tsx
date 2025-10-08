import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BusinessApplicationsManager = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_applications')
        .select(`
          *,
          user:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (application: any) => {
    setSelectedApp(application);
    setShowApprovalDialog(true);
  };

  const completeApproval = async () => {
    if (!selectedApp || !selectedCategoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use the applicant's user_id from the application, not the admin's user_id
      const applicantUserId = selectedApp.user_id;
      
      if (!applicantUserId) {
        throw new Error('Application does not have an associated user. Please ask the applicant to resubmit.');
      }

      // Create business listing for the applicant
      const { data: listingData, error: listingError } = await supabase
        .from('business_listings')
        .insert({
          user_id: applicantUserId,  // Use applicant's user_id, not admin's
          category_id: selectedCategoryId,
          business_name: selectedApp.business_name,
          description: selectedApp.description,
          location: selectedApp.location,
          phone_number: selectedApp.phone_number,
          email: selectedApp.email,
          status: 'approved',
          featured: false
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create default service for the business
      const { error: serviceError } = await supabase
        .from('services')
        .insert({
          category_id: selectedCategoryId,
          business_listing_id: listingData.id,
          title: selectedApp.business_name,
          description: selectedApp.description,
          location: selectedApp.location,
          active: true,
          rating: 0,
          review_count: 0,
          response_time: '24h',
          availability_status: 'available',
          featured: false,
          verified: false,
          price_unit: 'service'
        });

      if (serviceError) throw serviceError;

      // Update application status
      const { error: updateError } = await supabase
        .from('business_applications')
        .update({ status: 'approved' })
        .eq('id', selectedApp.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Business approved! They can now claim and manage their listing.",
      });

      setShowApprovalDialog(false);
      setSelectedApp(null);
      setSelectedCategoryId('');
      fetchApplications();
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('business_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application rejected",
      });

      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const processedApps = applications.filter(a => a.status !== 'pending');

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Business Applications</span>
              <Badge variant="secondary">{pendingApps.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApps.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending applications</p>
            ) : (
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{app.business_name}</span>
                          {getStatusBadge(app.status)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{app.business_type}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {app.phone_number}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {app.location}
                          </div>
                        </div>

                        {app.user && (
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                            <span className="text-muted-foreground">Submitted by user: </span>
                            <span className="font-medium">{app.user.email}</span>
                          </div>
                        )}

                         <div className="text-sm space-y-1">
                          <p className="text-muted-foreground line-clamp-2">{app.description}</p>
                          <p className="font-medium">Contact: {app.contact_person}</p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Submitted {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApprove(app)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Application History</CardTitle>
          </CardHeader>
          <CardContent>
            {processedApps.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No processed applications</p>
            ) : (
              <div className="space-y-3">
                {processedApps.slice(0, 10).map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{app.business_name}</span>
                          {getStatusBadge(app.status)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{app.business_type}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {app.phone_number}
                          </div>
                        </div>

                        {app.user && (
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                            <span className="text-muted-foreground">Submitted by: </span>
                            <span className="font-medium">{app.user.email}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {app.status === 'rejected' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleApprove(app)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {app.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(app.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Business Application</DialogTitle>
            <DialogDescription>
              Select a category for {selectedApp?.business_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Business Category *</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={completeApproval}>
                Approve & Create Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
