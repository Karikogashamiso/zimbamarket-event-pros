import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Trash2, Edit, Send, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showVenueDialog, setShowVenueDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the admin panel.",
        variant: "destructive",
      });
      navigate('/auth?tab=login');
      return;
    }
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') throw roleError;

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await fetchAdminData();
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin status.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch all venues
      const { data: venuesData } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false });
      setVenues(venuesData || []);

      // Fetch all events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*, venue:venues(name, city)')
        .order('start_datetime', { ascending: false });
      setEvents(eventsData || []);

      // Fetch all orders with tickets
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          tickets(count)
        `)
        .order('created_at', { ascending: false });
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);

      if (error) throw error;

      toast({ title: "Venue deleted successfully" });
      await fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete venue.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({ title: "Event deleted successfully" });
      await fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const handleSaveVenue = async (e: React.FormEvent<HTMLFormElement>) => {
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

      setShowVenueDialog(false);
      setEditingVenue(null);
      await fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save venue.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const eventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        venue_id: formData.get('venue_id') as string,
        event_category: formData.get('event_category') as any,
        start_datetime: formData.get('start_datetime') as string,
        end_datetime: formData.get('end_datetime') as string,
        is_published: formData.get('is_published') === 'true',
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData as any)
          .eq('id', editingEvent.id);
        if (error) throw error;
        toast({ title: "Event updated successfully" });
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData as any);
        if (error) throw error;
        toast({ title: "Event created successfully" });
      }

      setShowEventDialog(false);
      setEditingEvent(null);
      await fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event.",
        variant: "destructive",
      });
    }
  };

  const handleResendTickets = async (orderId: string, customerEmail: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-order-confirmation', {
        body: { orderId }
      });

      if (error) throw error;

      toast({
        title: "Tickets Resent",
        description: `Tickets have been sent to ${customerEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend tickets.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Panel | ZimEventPro</title>
      </Helmet>

      <div className="h-20"></div>

      <section className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-xl text-white/90">Manage events, venues, and orders</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{venues.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="venues" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="venues">Venues</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="venues">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Venues</CardTitle>
                  <Dialog open={showVenueDialog} onOpenChange={setShowVenueDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingVenue(null)}>Add Venue</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingVenue ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveVenue} className="space-y-4">
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
                          <Button type="button" variant="outline" onClick={() => setShowVenueDialog(false)}>Cancel</Button>
                          <Button type="submit">Save Venue</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
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
                      {venues.map((venue) => (
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
                                  setShowVenueDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteVenue(venue.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Events</CardTitle>
                  <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingEvent(null)}>Add Event</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveEvent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="title">Event Title *</Label>
                            <Input id="title" name="title" defaultValue={editingEvent?.title} required />
                          </div>
                          <div>
                            <Label htmlFor="venue_id">Venue *</Label>
                            <Select name="venue_id" defaultValue={editingEvent?.venue_id} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select venue" />
                              </SelectTrigger>
                              <SelectContent>
                                {venues.map((venue) => (
                                  <SelectItem key={venue.id} value={venue.id}>
                                    {venue.name} ({venue.city})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="event_category">Category *</Label>
                            <Select name="event_category" defaultValue={editingEvent?.event_category} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="concert">Concert</SelectItem>
                                <SelectItem value="conference">Conference</SelectItem>
                                <SelectItem value="festival">Festival</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="start_datetime">Start Date & Time *</Label>
                            <Input
                              id="start_datetime"
                              name="start_datetime"
                              type="datetime-local"
                              defaultValue={editingEvent?.start_datetime?.slice(0, 16)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_datetime">End Date & Time</Label>
                            <Input
                              id="end_datetime"
                              name="end_datetime"
                              type="datetime-local"
                              defaultValue={editingEvent?.end_datetime?.slice(0, 16)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingEvent?.description} rows={3} />
                          </div>
                          <div>
                            <Label htmlFor="is_published">Status</Label>
                            <Select name="is_published" defaultValue={editingEvent?.is_published ? 'true' : 'false'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Published</SelectItem>
                                <SelectItem value="false">Draft</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
                          <Button type="submit">Save Event</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>{event.venue?.name}</TableCell>
                          <TableCell>{new Date(event.start_datetime).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={event.is_published ? 'default' : 'secondary'}>
                              {event.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingEvent(event);
                                  setShowEventDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Orders & Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.customer_first_name} {order.customer_last_name}</TableCell>
                          <TableCell>{order.customer_email}</TableCell>
                          <TableCell>${order.total_amount}</TableCell>
                          <TableCell>
                            <Badge variant={order.order_status === 'completed' ? 'default' : 'secondary'}>
                              {order.order_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendTickets(order.id, order.customer_email)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Resend Tickets
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
