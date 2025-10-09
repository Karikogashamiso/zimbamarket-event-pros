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
  FileText,
  Trash2
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BusinessApplicationsManager = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
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
        .select('*')
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

    if (processing) return; // Prevent double-click
    
    try {
      setProcessing(true);
      const applicantUserId = selectedApp.user_id;
      
      // If application has a user_id, create listing and service
      if (applicantUserId) {
        // Create business listing for the applicant
        const { data: listingData, error: listingError } = await supabase
          .from('business_listings')
          .insert({
            user_id: applicantUserId,
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
            is_featured: false,
            is_verified: false,
            price_unit: 'service'
          });

        if (serviceError) throw serviceError;
      }

      // Update application status (works for both user and guest applications)
      const { error: updateError } = await supabase
        .from('business_applications')
        .update({ status: 'approved' })
        .eq('id', selectedApp.id);

      if (updateError) throw updateError;

      // Send approval notification email
      try {
        const category = categories.find(c => c.id === selectedCategoryId);
        await supabase.functions.invoke('send-application-status-update', {
          body: {
            email: selectedApp.email,
            businessName: selectedApp.business_name,
            contactPerson: selectedApp.contact_person,
            status: 'approved',
            categoryName: category?.name
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't block success if email fails
      }

      const successMessage = applicantUserId 
        ? "Business approved! They can now manage their listing."
        : "Application approved! Business will be listed once owner claims it.";
      
      toast({
        title: "Success",
        description: successMessage,
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
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (processing) return; // Prevent double-click
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('business_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      // Get application details for email
      const application = applications.find(a => a.id === applicationId);
      
      // Send rejection notification email
      if (application) {
        try {
          await supabase.functions.invoke('send-application-status-update', {
            body: {
              email: application.email,
              businessName: application.business_name,
              contactPerson: application.contact_person,
              status: 'rejected'
            }
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't block success if email fails
        }
      }

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
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!deleteApplicationId) return;

    try {
      const { error } = await supabase
        .from('business_applications')
        .delete()
        .eq('id', deleteApplicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application record deleted successfully",
      });

      setDeleteApplicationId(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete application",
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

                        {app.user_id && (
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                            <span className="text-muted-foreground">Submitted by: </span>
                            <span className="font-medium">{app.contact_person}</span>
                            {app.user_id && <span className="text-muted-foreground ml-2">(User Account)</span>}
                          </div>
                        )}
                        {!app.user_id && (
                          <div className="text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-md">
                            <span className="text-muted-foreground">Submitted by: </span>
                            <span className="font-medium">{app.contact_person}</span>
                            <span className="text-muted-foreground ml-2">(Guest)</span>
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
                          disabled={processing}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                          disabled={processing}
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

                        {app.user_id && (
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                            <span className="text-muted-foreground">Submitted by: </span>
                            <span className="font-medium">{app.contact_person}</span>
                            <span className="text-muted-foreground ml-2">(User Account)</span>
                          </div>
                        )}
                        {!app.user_id && (
                          <div className="text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-md">
                            <span className="text-muted-foreground">Submitted by: </span>
                            <span className="font-medium">{app.contact_person}</span>
                            <span className="text-muted-foreground ml-2">(Guest)</span>
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
                            disabled={processing}
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
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeleteApplicationId(app.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteApplicationId} onOpenChange={() => setDeleteApplicationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this application record from the history. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
