import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Plus, Settings, Users, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddTicketTypeForm } from "@/components/AddTicketTypeForm";
import { AddEventAddonForm } from "@/components/AddEventAddonForm";
import { AddTripTicketTypeForm } from "@/components/AddTripTicketTypeForm";
import { AddTripAddonForm } from "@/components/AddTripAddonForm";
import { OrganizerProfileSwitcher } from "@/components/OrganizerProfileSwitcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

const OrganizerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState<unknown[]>([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState<unknown>(null);
  const [venues, setVenues] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [routes, setRoutes] = useState<unknown[]>([]);
  const [showOrganizerForm, setShowOrganizerForm] = useState(false);
  const [selectedOriginId, setSelectedOriginId] = useState<string>('');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVenue, setEditingVenue] = useState<unknown>(null);
  const [showVenueDialog, setShowVenueDialog] = useState(false);
  const [deleteVenueId, setDeleteVenueId] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the organizer dashboard.",
        variant: "destructive",
      });
      navigate('/auth?tab=login');
      return;
    }
    checkOrganizerStatus();
  }, [user, authLoading, checkOrganizerStatus, navigate, toast]);

  const checkOrganizerStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setOrganizers(data);
        setSelectedOrganizer(data[0]); // Select the first/newest organizer by default
        await fetchOrganizerData(data[0].id);
      } else {
        setShowOrganizerForm(true);
      }
    } catch (error: unknown) {
      console.error('Error checking organizer status:', error);
      toast({
        title: "Error",
        description: "Failed to load organizer information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchOrganizerData = async (organizerId: string) => {
    try {
      // Fetch venues
      const { data: venuesData } = await supabase
        .from('venues')
        .select('*')
        .eq('organizer_id', organizerId);
      setVenues(venuesData || []);

      // Fetch events with ticket types and add-ons
      const { data: eventsData } = await supabase
        .from('events')
        .select('*, venue:venues(name), ticket_types(*), event_addons(*)')
        .eq('organizer_id', organizerId);
      setEvents(eventsData || []);

      // Fetch routes with trips, ticket types, and addons
      const { data: routesData } = await supabase
        .from('transport_routes')
        .select(`
          *,
          origin_venue:venues!transport_routes_origin_venue_id_fkey(name, city),
          destination_venue:venues!transport_routes_destination_venue_id_fkey(name, city),
          transport_trips(
            id,
            trip_number,
            departure_datetime,
            arrival_datetime,
            ticket_types(id, name, base_price, max_quantity, description),
            addons:event_addons(id, name, price, category, description)
          )
        `)
        .eq('organizer_id', organizerId);
      setRoutes(routesData || []);

      // Fetch orders for this organizer
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          tickets!inner(
            id,
            ticket_type:ticket_types!inner(
              id,
              event:events(id, title, is_published, is_cancelled),
              trip:transport_trips(
                id,
                trip_number,
                route:transport_routes(id, organizer_id)
              )
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      // Filter orders that belong to this organizer and have valid events/trips
      const organizerOrders = ordersData?.filter((order: Record<string, unknown>) => {
        return (order.tickets as Record<string, unknown>[] | undefined)?.some((ticket: Record<string, unknown>) => {
          const ticketType = ticket.ticket_type;
          if (!ticketType) return false;
          
          // Check if it's an event order with valid, published, non-cancelled event
          if (ticketType.event) {
            return ticketType.event.is_published && !ticketType.event.is_cancelled;
          }
          
          // Check if it's a transport order belonging to this organizer
          if (ticketType.trip?.route) {
            return ticketType.trip.route.organizer_id === organizerId;
          }
          
          return false;
        });
      }) || [];
      
      setOrders(organizerOrders);
    } catch (error) {
      console.error('Error fetching organizer data:', error);
    }
  };

  const createOrganizer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const { data, error } = await supabase
        .from('organizers')
        .insert({
          user_id: user?.id,
          business_name: formData.get('business_name') as string,
          business_type: formData.get('business_type') as any,
          email: formData.get('email') as string,
          phone_number: formData.get('phone_number') as string,
          description: formData.get('description') as string,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const updatedOrganizers = [...organizers, data];
      setOrganizers(updatedOrganizers);
      setSelectedOrganizer(data);
      setShowOrganizerForm(false);
      await fetchOrganizerData(data.id);
      toast({
        title: "Success!",
        description: "Organizer profile created. You can now manage your business.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to create organizer profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createVenue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from('venues')
        .insert({
          organizer_id: selectedOrganizer.id,
          name: formData.get('venue_name') as string,
          venue_type: formData.get('venue_type') as string,
          address: formData.get('address') as string,
          city: formData.get('city') as string,
          capacity: parseInt(formData.get('capacity') as string) || null,
          description: formData.get('venue_description') as string,
        });

      if (error) throw error;

      toast({ title: "Venue created successfully!" });
      await fetchOrganizerData(selectedOrganizer.id);
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to create venue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const startDatetime = formData.get('start_datetime') as string;
      const endDatetime = formData.get('end_datetime') as string;
      
      // Validate end_datetime is after start_datetime if provided
      if (endDatetime && endDatetime <= startDatetime) {
        toast({ 
          title: "Invalid dates", 
          description: "End date must be after start date",
          variant: "destructive" 
        });
        return;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          organizer_id: selectedOrganizer.id,
          venue_id: formData.get('venue_id') as string,
          title: formData.get('title') as string,
          description: formData.get('event_description') as string,
          event_category: formData.get('event_category') as any,
          start_datetime: startDatetime,
          end_datetime: endDatetime || null, // Convert empty string to null
          is_published: true,
        } as any);

      if (error) throw error;

      toast({ title: "Event created successfully!" });
      await fetchOrganizerData(selectedOrganizer.id);
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const formData = new FormData(e.currentTarget);

    const originId = formData.get('origin_venue_id') as string;
    const destinationId = formData.get('destination_venue_id') as string;

    // Validate that origin and destination are different
    if (originId === destinationId) {
      toast({
        title: "Invalid Route",
        description: "Origin and destination must be different venues.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: routeData, error: routeError } = await supabase
        .from('transport_routes')
        .insert({
          organizer_id: selectedOrganizer.id,
          route_name: formData.get('route_name') as string,
          transport_type: formData.get('transport_type') as any,
          origin_venue_id: originId,
          destination_venue_id: destinationId,
        } as any)
        .select()
        .single();

      if (routeError) throw routeError;

      // Create a trip for this route
      const { data: tripData, error: tripError } = await supabase
        .from('transport_trips')
        .insert({
          route_id: routeData.id,
          departure_datetime: formData.get('departure_datetime') as string,
          arrival_datetime: formData.get('arrival_datetime') as string,
          trip_number: formData.get('trip_number') as string,
        } as any)
        .select()
        .single();

      if (tripError) throw tripError;

      toast({ title: "Route and trip created successfully! Now add ticket types." });
      await fetchOrganizerData(selectedOrganizer.id);
      (e.target as HTMLFormElement).reset();
      setSelectedOriginId('');
      setSelectedDestinationId('');
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to create route.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrganizer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('organizers')
        .update({
          business_name: formData.get('business_name') as string,
          email: formData.get('email') as string,
          phone_number: formData.get('phone_number') as string,
          description: formData.get('description') as string,
          website: formData.get('website') as string,
          address: formData.get('address') as string,
          city: formData.get('city') as string,
          country: formData.get('country') as string,
        })
        .eq('id', selectedOrganizer.id);

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
      setEditingProfile(false);
      await checkOrganizerStatus();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateVenue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const venueData = {
        name: formData.get('venue_name') as string,
        venue_type: formData.get('venue_type') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        capacity: parseInt(formData.get('capacity') as string) || null,
        description: formData.get('venue_description') as string,
      };

      const { error } = await supabase
        .from('venues')
        .update(venueData)
        .eq('id', editingVenue.id)
        .eq('organizer_id', selectedOrganizer.id); // Security: ensure organizer owns the venue

      if (error) throw error;

      toast({ title: "Venue updated successfully!" });
      setShowVenueDialog(false);
      setEditingVenue(null);
      await fetchOrganizerData(selectedOrganizer.id);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to update venue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVenue = async () => {
    if (!deleteVenueId) return;

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', deleteVenueId)
        .eq('organizer_id', selectedOrganizer.id); // Security: ensure organizer owns the venue

      if (error) throw error;

      toast({ title: "Venue deleted successfully!" });
      await fetchOrganizerData(selectedOrganizer.id);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete venue.",
        variant: "destructive",
      });
    } finally {
      setDeleteVenueId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showOrganizerForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {organizers.length > 0 ? 'Add Another Organizer Profile' : 'Become an Organizer'}
              </CardTitle>
              <CardDescription>
                {organizers.length > 0 
                  ? 'Create additional organizer profiles for different business types'
                  : 'Create your organizer profile to start adding events and transport services'
                }
              </CardDescription>
              {organizers.length > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setShowOrganizerForm(false)}
                  className="mt-2"
                >
                  ← Back to Dashboard
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={createOrganizer} className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input id="business_name" name="business_name" required />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select name="business_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event_organizer">Event Organizer</SelectItem>
                      <SelectItem value="transport_operator">Transport Operator</SelectItem>
                      <SelectItem value="venue_owner">Venue Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={user?.email} 
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input id="phone_number" name="phone_number" type="tel" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Organizer Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Organizer Dashboard | ZimEventPro</title>
      </Helmet>

      <div className="h-20"></div>

      <section className="bg-gradient-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold">{selectedOrganizer?.business_name}</h1>
                {selectedOrganizer?.status === 'approved' && (
                  <Badge variant="secondary" className="bg-green-500 text-white border-none">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-white/90 capitalize">
                {selectedOrganizer?.business_type?.replace('_', ' ')}
                {selectedOrganizer?.city && selectedOrganizer?.country && (
                  <> • {selectedOrganizer.city}, {selectedOrganizer.country}</>
                )}
              </p>
            </div>
            <OrganizerProfileSwitcher
              organizers={organizers}
              selectedOrganizer={selectedOrganizer}
              onSelectOrganizer={(id) => {
                const org = organizers.find(o => o.id === id);
                if (org) {
                  setSelectedOrganizer(org);
                  fetchOrganizerData(org.id);
                }
              }}
              onAddProfile={() => setShowOrganizerForm(true)}
            />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Dynamic summary cards based on business type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(selectedOrganizer?.business_type === 'venue_operator' || selectedOrganizer?.business_type === 'event_organizer' || selectedOrganizer?.business_type === 'transport_operator') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Venues</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{venues.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {venues.length === 0 ? 'No venues yet' : `${venues.filter(v => v.is_active).length} active`}
                  </p>
                </CardContent>
              </Card>
            )}
            {selectedOrganizer?.business_type === 'event_organizer' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {events.length === 0 ? 'No events yet' : `${events.filter(e => e.is_published).length} published`}
                  </p>
                </CardContent>
              </Card>
            )}
            {selectedOrganizer?.business_type === 'transport_operator' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Routes</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{routes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {routes.length === 0 ? 'No routes yet' : `${routes.filter(r => r.is_active).length} active`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conditional tabs based on business type */}
          <Tabs defaultValue={
            selectedOrganizer?.business_type === 'venue_operator' ? 'venues' :
            selectedOrganizer?.business_type === 'event_organizer' ? 'events' :
            'venues'
          } className="space-y-6">
            <TabsList className={`grid w-full ${
              selectedOrganizer?.business_type === 'venue_operator' ? 'grid-cols-3' :
              selectedOrganizer?.business_type === 'event_organizer' ? 'grid-cols-4' :
              'grid-cols-4'
            }`}>
              {(selectedOrganizer?.business_type === 'venue_operator' || selectedOrganizer?.business_type === 'event_organizer' || selectedOrganizer?.business_type === 'transport_operator') && (
                <TabsTrigger value="venues">Venues</TabsTrigger>
              )}
              {selectedOrganizer?.business_type === 'event_organizer' && (
                <TabsTrigger value="events">Events</TabsTrigger>
              )}
              {selectedOrganizer?.business_type === 'transport_operator' && (
                <TabsTrigger value="transport">Transport</TabsTrigger>
              )}
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {(selectedOrganizer?.business_type === 'venue_operator' || selectedOrganizer?.business_type === 'event_organizer' || selectedOrganizer?.business_type === 'transport_operator') && (
              <TabsContent value="venues" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createVenue} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venue_name">Venue Name *</Label>
                      <Input id="venue_name" name="venue_name" required />
                    </div>
                    <div>
                      <Label htmlFor="venue_type">Venue Type *</Label>
                      <Input id="venue_type" name="venue_type" placeholder="e.g., Conference Hall" required />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" name="address" required />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input id="capacity" name="capacity" type="number" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="venue_description">Description</Label>
                      <Textarea id="venue_description" name="venue_description" rows={2} />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Adding..." : "Add Venue"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Venues</CardTitle>
                </CardHeader>
                <CardContent>
                  {venues.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No venues yet. Add your first venue above.</p>
                  ) : (
                    <div className="space-y-3">
                      {venues.map((venue) => (
                        <div key={venue.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold">{venue.name}</h3>
                              <p className="text-sm text-muted-foreground">{venue.venue_type}</p>
                              <p className="text-sm text-muted-foreground">{venue.address}, {venue.city}</p>
                              {venue.capacity && <p className="text-sm">Capacity: {venue.capacity}</p>}
                              {venue.description && <p className="text-sm text-muted-foreground mt-2">{venue.description}</p>}
                            </div>
                            <div className="flex gap-2">
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
                                onClick={() => setDeleteVenueId(venue.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Venue Dialog */}
              <Dialog open={showVenueDialog} onOpenChange={setShowVenueDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Venue</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={updateVenue} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_venue_name">Venue Name *</Label>
                      <Input id="edit_venue_name" name="venue_name" defaultValue={editingVenue?.name} required />
                    </div>
                    <div>
                      <Label htmlFor="edit_venue_type">Venue Type *</Label>
                      <Input id="edit_venue_type" name="venue_type" defaultValue={editingVenue?.venue_type} required />
                    </div>
                    <div>
                      <Label htmlFor="edit_address">Address *</Label>
                      <Input id="edit_address" name="address" defaultValue={editingVenue?.address} required />
                    </div>
                    <div>
                      <Label htmlFor="edit_city">City *</Label>
                      <Input id="edit_city" name="city" defaultValue={editingVenue?.city} required />
                    </div>
                    <div>
                      <Label htmlFor="edit_capacity">Capacity</Label>
                      <Input id="edit_capacity" name="capacity" type="number" defaultValue={editingVenue?.capacity} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit_venue_description">Description</Label>
                      <Textarea id="edit_venue_description" name="venue_description" defaultValue={editingVenue?.description} rows={2} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowVenueDialog(false);
                        setEditingVenue(null);
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Delete Venue Confirmation */}
              <AlertDialog open={!!deleteVenueId} onOpenChange={(open) => !open && setDeleteVenueId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this venue? This action cannot be undone and may affect associated events.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteVenue} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </TabsContent>
            )}

            {selectedOrganizer?.business_type === 'event_organizer' && (
              <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div>
                      <Label htmlFor="venue_id">Venue *</Label>
                      <Select name="venue_id" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                        <SelectContent>
                          {venues.map((venue) => (
                            <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event_category">Category *</Label>
                      <Select name="event_category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="club_night">Club Night</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="start_datetime">Start Date & Time *</Label>
                      <Input id="start_datetime" name="start_datetime" type="datetime-local" required />
                    </div>
                    <div>
                      <Label htmlFor="end_datetime">End Date & Time</Label>
                      <Input id="end_datetime" name="end_datetime" type="datetime-local" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="event_description">Description</Label>
                      <Textarea id="event_description" name="event_description" rows={3} />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No events yet. Create your first event above.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.start_datetime).toLocaleString()}
                            </p>
                            <p className="text-sm">Venue: {event.venue?.name}</p>
                            <p className="text-sm">
                              Status: <span className={event.is_published ? "text-green-600" : "text-yellow-600"}>
                                {event.is_published ? "Published" : "Draft"}
                              </span>
                            </p>
                            
                            {event.ticket_types && event.ticket_types.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Ticket Types:</p>
                                <div className="space-y-1">
                                  {event.ticket_types.map((ticket: Record<string, unknown>) => (
                                    <div key={ticket.id} className="text-xs flex justify-between items-center">
                                      <span>{ticket.name}</span>
                                      <span className="font-medium">${ticket.base_price}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {event.event_addons && event.event_addons.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Event Add-Ons:</p>
                                <div className="space-y-1">
                                  {event.event_addons.map((addon: Record<string, unknown>) => (
                                    <div key={addon.id} className="text-xs flex justify-between items-center">
                                      <span>{addon.name} ({addon.category})</span>
                                      <span className="font-medium">${addon.price}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <AddTicketTypeForm 
                            eventId={event.id} 
                            onSuccess={() => fetchOrganizerData(selectedOrganizer.id)} 
                          />
                          <AddEventAddonForm
                            eventId={event.id}
                            onAddonAdded={() => fetchOrganizerData(selectedOrganizer.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </TabsContent>
            )}

            {selectedOrganizer?.business_type === 'transport_operator' && (
              <TabsContent value="transport" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Transport Route & Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createRoute} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="route_name">Route Name *</Label>
                      <Input id="route_name" name="route_name" placeholder="e.g., Harare - Bulawayo Express" required />
                    </div>
                    <div>
                      <Label htmlFor="transport_type">Transport Type *</Label>
                      <Select name="transport_type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="flight">Flight</SelectItem>
                          <SelectItem value="ferry">Ferry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="trip_number">Trip Number</Label>
                      <Input id="trip_number" name="trip_number" placeholder="e.g., TR001" />
                    </div>
                    <div>
                      <Label htmlFor="origin_venue_id">Origin *</Label>
                      <Select 
                        name="origin_venue_id" 
                        required 
                        value={selectedOriginId}
                        onValueChange={setSelectedOriginId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {venues
                            .filter(venue => !selectedDestinationId || venue.id !== selectedDestinationId)
                            .map((venue) => (
                              <SelectItem key={venue.id} value={venue.id}>{venue.name}, {venue.city}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="destination_venue_id">Destination *</Label>
                      <Select 
                        name="destination_venue_id" 
                        required
                        value={selectedDestinationId}
                        onValueChange={setSelectedDestinationId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {venues
                            .filter(venue => !selectedOriginId || venue.id !== selectedOriginId)
                            .map((venue) => (
                              <SelectItem key={venue.id} value={venue.id}>{venue.name}, {venue.city}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="departure_datetime">Departure *</Label>
                      <Input 
                        id="departure_datetime" 
                        name="departure_datetime" 
                        type="datetime-local" 
                        required 
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="arrival_datetime">Arrival *</Label>
                      <Input 
                        id="arrival_datetime" 
                        name="arrival_datetime" 
                        type="datetime-local" 
                        required 
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Route & Trip"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  {routes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No routes yet. Create your first route above.</p>
                  ) : (
                    <div className="space-y-4">
                      {routes.map((route: Record<string, unknown>) => (
                        <div key={route.id} className="border rounded-lg p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{route.route_name}</h3>
                            <Badge variant="outline" className="mt-1 capitalize">
                              {route.transport_type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground">From</p>
                              <p>{route.origin_venue?.name}</p>
                              <p className="text-xs text-muted-foreground">{route.origin_venue?.city}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">To</p>
                              <p>{route.destination_venue?.name}</p>
                              <p className="text-xs text-muted-foreground">{route.destination_venue?.city}</p>
                            </div>
                          </div>

                          {route.transport_trips && route.transport_trips.length > 0 && (
                            <div className="border-t pt-3 space-y-3">
                              <p className="font-medium text-sm">Upcoming Trips:</p>
                              {(route.transport_trips as Record<string, unknown>[]).slice(0, 3).map((trip: Record<string, unknown>) => (
                                <div key={trip.id} className="bg-muted/50 rounded p-3 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm">Trip #{trip.trip_number}</span>
                                    {trip.ticket_types?.[0] && (
                                      <span className="font-bold">${trip.ticket_types[0].base_price}</span>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>
                                      <p className="font-medium">Departure</p>
                                      <p>{new Date(trip.departure_datetime).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Arrival</p>
                                      <p>{new Date(trip.arrival_datetime).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}</p>
                                    </div>
                                  </div>

                                  {/* Ticket Types */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <p className="font-medium text-xs">Ticket Types</p>
                                      <AddTripTicketTypeForm 
                                        tripId={trip.id} 
                                        onSuccess={() => fetchOrganizerData(selectedOrganizer.id)} 
                                      />
                                    </div>
                                    {trip.ticket_types && trip.ticket_types.length > 0 ? (
                                      <div className="space-y-1">
                                        {(trip.ticket_types as Record<string, unknown>[]).map((ticket: Record<string, unknown>) => (
                                          <div key={ticket.id} className="flex justify-between text-xs bg-background rounded p-2">
                                            <span>{ticket.name}</span>
                                            <div className="flex gap-2">
                                              <span className="font-medium">${ticket.base_price}</span>
                                              <span className="text-muted-foreground">
                                                {ticket.max_quantity} seats
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">No ticket types yet</p>
                                    )}
                                  </div>

                                  {/* Add-ons */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <p className="font-medium text-xs">Add-ons</p>
                                      <AddTripAddonForm 
                                        tripId={trip.id} 
                                        onAddonAdded={() => fetchOrganizerData(selectedOrganizer.id)} 
                                      />
                                    </div>
                                    {trip.addons && trip.addons.length > 0 ? (
                                      <div className="space-y-1">
                                        {(trip.addons as Record<string, unknown>[]).map((addon: Record<string, unknown>) => (
                                          <div key={addon.id} className="flex justify-between text-xs bg-background rounded p-2">
                                            <span>{addon.name}</span>
                                            <span className="font-medium">${addon.price}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">No add-ons yet</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </TabsContent>
            )}

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>View and manage customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground">
                        Orders from customers will appear here once they start booking your events or transport services.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const ticketCount = order.tickets?.length || 0;
                        return (
                          <div key={order.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Order #{order.order_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.customer_first_name} {order.customer_last_name}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {order.customer_email}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={
                                  order.booking_status === 'confirmed' || order.payment_status === 'completed' 
                                    ? 'default' 
                                    : order.booking_status === 'cancelled' 
                                    ? 'destructive'
                                    : 'secondary'
                                }>
                                  {order.payment_status === 'completed' ? 'Paid' : order.booking_status}
                                </Badge>
                                <Badge variant="outline">
                                  {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Amount:</span>{' '}
                                <span className="font-medium">${order.total_amount}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>{' '}
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => navigate(`/order-confirmation/${order.order_number}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Organizer Profile</CardTitle>
                      <CardDescription>View and manage your organizer information</CardDescription>
                    </div>
                    {!editingProfile && (
                      <Button onClick={() => setEditingProfile(true)} variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingProfile ? (
                    <form onSubmit={updateOrganizer} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit_business_name">Business Name *</Label>
                          <Input 
                            id="edit_business_name" 
                            name="business_name" 
                            defaultValue={selectedOrganizer?.business_name}
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_email">Email *</Label>
                          <Input 
                            id="edit_email" 
                            name="email" 
                            type="email" 
                            defaultValue={selectedOrganizer?.email}
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_phone_number">Phone Number</Label>
                          <Input 
                            id="edit_phone_number" 
                            name="phone_number" 
                            type="tel"
                            defaultValue={selectedOrganizer?.phone_number}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_website">Website</Label>
                          <Input 
                            id="edit_website" 
                            name="website" 
                            type="url"
                            placeholder="https://"
                            defaultValue={selectedOrganizer?.website}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_city">City</Label>
                          <Input 
                            id="edit_city" 
                            name="city"
                            defaultValue={selectedOrganizer?.city}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_country">Country</Label>
                          <Input 
                            id="edit_country" 
                            name="country"
                            defaultValue={selectedOrganizer?.country}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="edit_address">Address</Label>
                          <Input 
                            id="edit_address" 
                            name="address"
                            defaultValue={selectedOrganizer?.address}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="edit_description">Description</Label>
                          <Textarea 
                            id="edit_description" 
                            name="description" 
                            rows={3}
                            defaultValue={selectedOrganizer?.description}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setEditingProfile(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-xs">Business Name</Label>
                          <p className="font-medium">{selectedOrganizer?.business_name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Business Type</Label>
                          <p className="font-medium capitalize">{selectedOrganizer?.business_type?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Email</Label>
                          <p className="font-medium">{selectedOrganizer?.email}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Phone Number</Label>
                          <p className="font-medium">{selectedOrganizer?.phone_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Website</Label>
                          <p className="font-medium">
                            {selectedOrganizer?.website ? (
                              <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {selectedOrganizer.website}
                              </a>
                            ) : 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Status</Label>
                          <div>
                            <Badge variant={selectedOrganizer?.status === 'approved' ? 'default' : 'secondary'}>
                              {selectedOrganizer?.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">City</Label>
                          <p className="font-medium">{selectedOrganizer?.city || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Country</Label>
                          <p className="font-medium">{selectedOrganizer?.country || 'Not provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-muted-foreground text-xs">Address</Label>
                          <p className="font-medium">{selectedOrganizer?.address || 'Not provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-muted-foreground text-xs">Description</Label>
                          <p className="font-medium">{selectedOrganizer?.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default OrganizerDashboard;
