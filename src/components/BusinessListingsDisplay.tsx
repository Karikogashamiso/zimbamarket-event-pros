import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  ExternalLink,
  Edit,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BusinessListingsDisplayProps {
  userId: string;
}

export const BusinessListingsDisplay = ({ userId }: BusinessListingsDisplayProps) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [userId]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_listings')
        .select(`
          *,
          category:categories(name),
          services:services(id, title, active)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any null or undefined services (deleted services)
      const cleanedData = data?.map(listing => ({
        ...listing,
        services: listing.services?.filter((s: any) => s && s.id) || []
      }));
      
      setListings(cleanedData || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your business listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditListing = (listing: any) => {
    setSelectedListing(listing);
    setShowEditDialog(true);
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      const { error } = await supabase
        .from('business_listings')
        .update({
          business_name: formData.get('business_name') as string,
          description: formData.get('description') as string,
          location: formData.get('location') as string,
          phone_number: formData.get('phone_number') as string,
          email: formData.get('email') as string,
          website: formData.get('website') as string,
          address: formData.get('address') as string,
          price_from: formData.get('price_from') ? parseFloat(formData.get('price_from') as string) : null,
          capacity_min: formData.get('capacity_min') ? parseInt(formData.get('capacity_min') as string) : null,
          capacity_max: formData.get('capacity_max') ? parseInt(formData.get('capacity_max') as string) : null,
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business listing updated successfully",
      });

      setShowEditDialog(false);
      setSelectedListing(null);
      fetchListings();
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          Pending Review
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          Active
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading business listings...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Business Listings</span>
            <Badge variant="secondary">{listings.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No business listings yet</p>
              <Button onClick={() => window.location.href = '/list-business'}>
                <Plus className="w-4 h-4 mr-2" />
                List Your Business
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-lg">{listing.business_name}</span>
                        {getStatusBadge(listing.status)}
                        {listing.featured && (
                          <Badge className="bg-gradient-primary text-white">Featured</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground">Category: {listing.category?.name || 'N/A'}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </div>
                        {listing.phone_number && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {listing.phone_number}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {listing.email}
                        </div>
                        {listing.price_from && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            From ${listing.price_from}
                          </div>
                        )}
                        {listing.website && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                              Website
                            </a>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

                      {listing.services && (
                        <div className="flex items-center gap-2 flex-wrap text-xs mt-2">
                          <span className="text-muted-foreground">Services:</span>
                          {listing.services.length === 0 ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600">
                              No services created yet
                            </Badge>
                          ) : (
                            <>
                              <Badge variant="outline">
                                {listing.services.length} total
                              </Badge>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                {listing.services.filter((s: any) => s.active).length} active
                              </Badge>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditListing(listing)}
                        disabled={listing.status !== 'approved'}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Details</DialogTitle>
            <DialogDescription>
              Update your business information, pricing, and contact details
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <form onSubmit={handleUpdateListing} className="space-y-4">
              <div>
                <Label>Business Name *</Label>
                <Input 
                  name="business_name" 
                  defaultValue={selectedListing.business_name}
                  required 
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea 
                  name="description" 
                  defaultValue={selectedListing.description}
                  rows={4}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location/Area *</Label>
                  <Input 
                    name="location" 
                    defaultValue={selectedListing.location}
                    placeholder="e.g., Harare, Bulawayo"
                    required 
                  />
                </div>

                <div>
                  <Label>Full Address</Label>
                  <Input 
                    name="address" 
                    defaultValue={selectedListing.address || ''}
                    placeholder="Full street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    name="phone_number" 
                    type="tel"
                    defaultValue={selectedListing.phone_number || ''}
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input 
                    name="email" 
                    type="email"
                    defaultValue={selectedListing.email}
                    required 
                  />
                </div>
              </div>

              <div>
                <Label>Website</Label>
                <Input 
                  name="website" 
                  type="url"
                  defaultValue={selectedListing.website || ''}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Starting Price ($)</Label>
                  <Input 
                    name="price_from" 
                    type="number"
                    step="0.01"
                    defaultValue={selectedListing.price_from || ''}
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <Label>Min Capacity</Label>
                  <Input 
                    name="capacity_min" 
                    type="number"
                    defaultValue={selectedListing.capacity_min || ''}
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <Label>Max Capacity</Label>
                  <Input 
                    name="capacity_max" 
                    type="number"
                    defaultValue={selectedListing.capacity_max || ''}
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
