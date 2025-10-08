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
  Users,
  Image as ImageIcon,
  ExternalLink,
  Edit
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BusinessListingsManager = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
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

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_listings')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load business listings",
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
          status: formData.get('status') as string,
          featured: formData.get('featured') === 'true',
          price_from: formData.get('price_from') ? parseFloat(formData.get('price_from') as string) : null,
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
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          Approved
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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Business Listings</span>
              <Badge variant="secondary">{listings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No business listings</p>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{listing.business_name}</span>
                          {getStatusBadge(listing.status)}
                          {listing.featured && (
                            <Badge className="bg-gradient-primary text-white">Featured</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">Category: {listing.category?.name || 'N/A'}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {listing.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {listing.phone_number || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.location}
                          </div>
                          {listing.price_from && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              From ${listing.price_from}
                            </div>
                          )}
                          {listing.website && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Website
                              </a>
                            </div>
                          )}
                          {listing.images && listing.images.length > 0 && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {listing.images.length} images
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

                        <p className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditListing(listing)}
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Listing</DialogTitle>
            <DialogDescription>
              Update business information and settings
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
                  <Label>Location *</Label>
                  <Input 
                    name="location" 
                    defaultValue={selectedListing.location}
                    required 
                  />
                </div>

                <div>
                  <Label>Price From</Label>
                  <Input 
                    name="price_from" 
                    type="number"
                    step="0.01"
                    defaultValue={selectedListing.price_from || ''}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    name="phone_number" 
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status *</Label>
                  <Select name="status" defaultValue={selectedListing.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Featured</Label>
                  <Select name="featured" defaultValue={selectedListing.featured ? 'true' : 'false'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
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
