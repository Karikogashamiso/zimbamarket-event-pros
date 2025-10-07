import { useState, useEffect } from "react";
import { Trash2, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Venues = () => {
  const { toast } = useToast();
  const [venues, setVenues] = useState<any[]>([]);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false });
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);

      if (error) throw error;

      toast({ title: "Venue deleted successfully" });
      await fetchVenues();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete venue.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const venueData = {
        name: formData.get('name') as string,
        venue_type: formData.get('venue_type') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        capacity: parseInt(formData.get('capacity') as string) || null,
        description: formData.get('description') as string,
      };

      if (editingVenue) {
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', editingVenue.id);
        if (error) throw error;
        toast({ title: "Venue updated successfully" });
      } else {
        const { error } = await supabase
          .from('venues')
          .insert(venueData);
        if (error) throw error;
        toast({ title: "Venue created successfully" });
      }

      setShowDialog(false);
      setEditingVenue(null);
      await fetchVenues();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save venue.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venues</h2>
          <p className="text-muted-foreground">Manage event venues and locations</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVenue(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVenue ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Venue Name *</Label>
                  <Input id="name" name="name" defaultValue={editingVenue?.name} required />
                </div>
                <div>
                  <Label htmlFor="venue_type">Type *</Label>
                  <Input id="venue_type" name="venue_type" defaultValue={editingVenue?.venue_type} required />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" name="address" defaultValue={editingVenue?.address} required />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" defaultValue={editingVenue?.city} required />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue={editingVenue?.capacity} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingVenue?.description} rows={3} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit">Save Venue</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Venues ({venues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No venues found. Create your first venue to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  venues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell className="font-medium">{venue.name}</TableCell>
                      <TableCell>{venue.venue_type}</TableCell>
                      <TableCell>{venue.city}</TableCell>
                      <TableCell>{venue.capacity || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingVenue(venue);
                              setShowDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(venue.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Venues;
