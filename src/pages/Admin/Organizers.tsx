import { useState, useEffect, useCallback} from "react";
import { Users, Check, X, Building2, Mail, Phone, MapPin, Globe, Shield, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Organizer {
  id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone_number: string | null;
  website: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
}

const businessTypeConfig = {
  event_organizer: { label: "Event Organizer", icon: "🎉", color: "bg-purple-500" },
  transport_operator: { label: "Transport Operator", icon: "🚌", color: "bg-blue-500" },
  venue_owner: { label: "Venue Owner", icon: "🏛️", color: "bg-green-500" },
};

export default function Organizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const fetchOrganizers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error: unknown) {
      console.error('Error fetching organizers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch organizers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateOrganizerStatus = async (organizerId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('organizers')
        .update({ status })
        .eq('id', organizerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Organizer ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      fetchOrganizers();
      setSelectedOrganizer(null);
    } catch (error: unknown) {
      console.error('Error updating organizer status:', error);
      toast({
        title: "Error",
        description: "Failed to update organizer status",
        variant: "destructive",
      });
    }
  };

  const updateVerificationStatus = async (organizerId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('organizers')
        .update({ is_verified: isVerified })
        .eq('id', organizerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Organizer ${isVerified ? 'verified' : 'unverified'} successfully`,
      });

      fetchOrganizers();
      setSelectedOrganizer(null);
    } catch (error: unknown) {
      console.error('Error updating verification status:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const deleteOrganizer = async () => {
    if (!selectedOrganizer) return;

    try {
      const { error } = await supabase
        .from('organizers')
        .delete()
        .eq('id', selectedOrganizer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Organizer deleted successfully",
      });

      fetchOrganizers();
      setSelectedOrganizer(null);
      setDeleteDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error deleting organizer:', error);
      toast({
        title: "Error",
        description: "Failed to delete organizer",
        variant: "destructive",
      });
    }
  };

  const getBusinessTypeConfig = (type: string) => {
    return businessTypeConfig[type as keyof typeof businessTypeConfig] || {
      label: type.replace('_', ' '),
      color: "bg-gray-500",
      icon: "📋"
    };
  };

  const renderOrganizerCard = (organizer: Organizer) => {
    const config = getBusinessTypeConfig(organizer.business_type);
    
    return (
      <Card
        key={organizer.id}
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSelectedOrganizer(organizer)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-2xl`}>
                {config.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{organizer.business_name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {config.label}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge
                variant={
                  organizer.status === 'approved'
                    ? 'default'
                    : organizer.status === 'rejected'
                    ? 'destructive'
                    : 'outline'
                }
                className="text-xs"
              >
                {organizer.status}
              </Badge>
              {organizer.is_verified && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{organizer.email}</span>
            </div>
            {organizer.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{organizer.phone_number}</span>
              </div>
            )}
            {organizer.city && organizer.country && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{organizer.city}, {organizer.country}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingOrganizers = organizers.filter(o => o.status === 'pending');
  const approvedOrganizers = organizers.filter(o => o.status === 'approved');
  const rejectedOrganizers = organizers.filter(o => o.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizer Management</h2>
          <p className="text-muted-foreground">Approve and verify organizer profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {organizers.length} Total
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingOrganizers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedOrganizers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedOrganizers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrganizers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No pending organizers</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrganizers.map(renderOrganizerCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedOrganizers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No approved organizers</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedOrganizers.map(renderOrganizerCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedOrganizers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No rejected organizers</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedOrganizers.map(renderOrganizerCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedOrganizer && (
        <Dialog open={!!selectedOrganizer} onOpenChange={() => setSelectedOrganizer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {selectedOrganizer.business_name}
              </DialogTitle>
              <DialogDescription>
                Manage organizer approval and verification status
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p className="text-lg">{getBusinessTypeConfig(selectedOrganizer.business_type).label}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={selectedOrganizer.status === 'approved' ? 'default' : 'outline'}>
                    {selectedOrganizer.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedOrganizer.email}</span>
                </div>
                {selectedOrganizer.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedOrganizer.phone_number}</span>
                  </div>
                )}
                {selectedOrganizer.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {selectedOrganizer.website}
                    </a>
                  </div>
                )}
                {selectedOrganizer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedOrganizer.address}</span>
                  </div>
                )}
              </div>

              {selectedOrganizer.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedOrganizer.description}</p>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Verification Status</p>
                    <p className="text-sm text-muted-foreground">Mark this organizer as verified</p>
                  </div>
                  <Button
                    variant={selectedOrganizer.is_verified ? "outline" : "default"}
                    onClick={() => updateVerificationStatus(selectedOrganizer.id, !selectedOrganizer.is_verified)}
                  >
                    {selectedOrganizer.is_verified ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Unverify
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="font-medium">Approval Status</p>
                    <p className="text-sm text-muted-foreground">Approve or reject this organizer</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedOrganizer.status !== 'approved' && (
                      <Button
                        variant="default"
                        onClick={() => updateOrganizerStatus(selectedOrganizer.id, 'approved')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {selectedOrganizer.status !== 'rejected' && (
                      <Button
                        variant="destructive"
                        onClick={() => updateOrganizerStatus(selectedOrganizer.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="font-medium text-destructive">Danger Zone</p>
                    <p className="text-sm text-muted-foreground">Permanently delete this organizer</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organizer
              <span className="font-semibold"> {selectedOrganizer?.business_name}</span> and
              all associated events, trips, and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteOrganizer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
