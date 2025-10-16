import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteStats {
  totalServices: number;
  totalOrders: number;
  totalCities: number;
  averageRating: number;
  totalProviders: number;
  totalEvents: number;
  totalVenues: number;
  satisfactionRate: number;
}

export const useStats = () => {
  return useQuery({
    queryKey: ["site-stats"],
    queryFn: async (): Promise<SiteStats> => {
      try {
        // Fetch services count
        const { count: servicesCount } = await supabase
          .from("services")
          .select("*", { count: "exact", head: true });

        // Fetch orders count
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Fetch events count
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        // Fetch venues count
        const { count: venuesCount } = await supabase
          .from("venues")
          .select("*", { count: "exact", head: true });

        // Fetch unique cities from services (using location field)
        const { data: services } = await supabase
          .from("services")
          .select("location")
          .not("location", "is", null);

        const uniqueCities = new Set(services?.map((s) => s.location) || []);

        // Calculate average rating from reviews
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating");

        const avgRating = reviews?.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Calculate satisfaction rate based on completed bookings
        const { data: ordersList } = await supabase
          .from("orders")
          .select("booking_status, payment_status");

        const successfulOrders = ordersList?.filter(
          o => o.booking_status === "completed" && o.payment_status === "completed"
        ).length || 0;
        const totalOrders = ordersList?.length || 0;

        const satisfactionRate =
          totalOrders > 0
            ? Math.round((successfulOrders / totalOrders) * 100)
            : 0;

        return {
          totalServices: servicesCount || 0,
          totalOrders: ordersCount || 0,
          totalCities: uniqueCities.size || 0,
          averageRating: Math.round(avgRating * 10) / 10,
          totalProviders: servicesCount || 0,
          totalEvents: eventsCount || 0,
          totalVenues: venuesCount || 0,
          satisfactionRate,
        };
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Return actual zero values instead of fake numbers
        return {
          totalServices: 0,
          totalOrders: 0,
          totalCities: 0,
          averageRating: 0,
          totalProviders: 0,
          totalEvents: 0,
          totalVenues: 0,
          satisfactionRate: 0,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
