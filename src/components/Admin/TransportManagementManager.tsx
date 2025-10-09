import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bus,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
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

export const TransportManagementManager = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
  const [deleteTripId, setDeleteTripId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransportData();
  }, []);

  const fetchTransportData = async () => {
    try {
      setLoading(true);

      // Fetch routes
      const { data: routesData, error: routesError } = await supabase
        .from('transport_routes')
        .select(`
          *,
          organizers(business_name)
        `)
        .order('created_at', { ascending: false });

      if (routesError) throw routesError;
      
      // Fetch venue names for routes
      const routesWithVenues = await Promise.all(
        (routesData || []).map(async (route) => {
          const { data: originVenue } = await supabase
            .from('venues')
            .select('name')
            .eq('id', route.origin_venue_id)
            .single();
          
          const { data: destVenue } = await supabase
            .from('venues')
            .select('name')
            .eq('id', route.destination_venue_id)
            .single();
          
          return {
            ...route,
            origin_venue: originVenue,
            destination_venue: destVenue
          };
        })
      );
      
      setRoutes(routesWithVenues);

      // Fetch trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('transport_trips')
        .select(`
          *,
          transport_routes(route_name, route_code)
        `)
        .order('departure_datetime', { ascending: false });

      if (tripsError) throw tripsError;
      setTrips(tripsData || []);

    } catch (error: any) {
      console.error('Error fetching transport data:', error);
      toast({
        title: "Error",
        description: "Failed to load transport data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteRouteId) return;

    try {
      // Database cascading will handle all related records
      const { error } = await supabase
        .from('transport_routes')
        .delete()
        .eq('id', deleteRouteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport route and all related data deleted successfully",
      });

      setDeleteRouteId(null);
      fetchTransportData();
    } catch (error: any) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete route",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrip = async () => {
    if (!deleteTripId) return;

    try {
      // Database cascading will handle all related records
      const { error } = await supabase
        .from('transport_trips')
        .delete()
        .eq('id', deleteTripId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip and all related data deleted successfully",
      });

      setDeleteTripId(null);
      fetchTransportData();
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transport data...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Transport Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transport Routes</span>
              <Badge variant="secondary">{routes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No transport routes</p>
            ) : (
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{route.route_name}</span>
                          <Badge variant="outline">
                            {route.transport_type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>From: {route.origin_venue?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>To: {route.destination_venue?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Duration: {route.estimated_duration_minutes} min
                          </div>
                          {route.distance_km && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Distance: {route.distance_km} km
                            </div>
                          )}
                        </div>

                        {route.organizers && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Operator: </span>
                            <span className="font-medium">{route.organizers.business_name}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(new Date(route.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="ml-4">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setDeleteRouteId(route.id)}
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

        {/* Transport Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scheduled Trips</span>
              <Badge variant="secondary">{trips.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No scheduled trips</p>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {trip.transport_routes?.route_name || 'Unknown Route'}
                          </span>
                          {trip.transport_routes?.route_code && (
                            <Badge variant="outline">{trip.transport_routes.route_code}</Badge>
                          )}
                          <Badge variant={trip.trip_status === 'scheduled' ? 'default' : 'secondary'}>
                            {trip.trip_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(trip.departure_datetime).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(trip.departure_datetime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Total Seats: {trip.total_seats}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Available: {trip.available_seats}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(new Date(trip.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="ml-4">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setDeleteTripId(trip.id)}
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

      {/* Delete Route Confirmation */}
      <AlertDialog open={!!deleteRouteId} onOpenChange={() => setDeleteRouteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transport Route?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this route and all associated trips. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Trip Confirmation */}
      <AlertDialog open={!!deleteTripId} onOpenChange={() => setDeleteTripId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this trip and all associated tickets. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrip}
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