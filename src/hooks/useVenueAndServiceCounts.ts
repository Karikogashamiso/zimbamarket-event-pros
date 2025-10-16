import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVenueAndServiceCounts = () => {
  return useQuery({
    queryKey: ["venue-service-counts"],
    queryFn: async () => {
      // Get total venues count
      const { count: totalVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true });

      // Get total services count
      const { count: totalServices } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true });

      // Get venues by city (location)
      const { data: venuesData } = await supabase
        .from("venues")
        .select("city, venue_type");

      // Get services by category
      const { data: servicesData } = await supabase
        .from("services")
        .select("title, category_id, business_listing_id")
        .not("category_id", "is", null);

      // Get business listings with location data
      const { data: businessListings } = await supabase
        .from("business_listings")
        .select("id, location, category_id");

      // Count venues by city (location)
      const venuesByLocation: Record<string, number> = {};
      venuesData?.forEach((venue) => {
        if (venue.city) {
          venuesByLocation[venue.city] = (venuesByLocation[venue.city] || 0) + 1;
        }
      });

      // Count services by category (approximate based on title keywords)
      const servicesByCategory: Record<string, number> = {
        catering: 0,
        bakers: 0,
        bartending: 0,
        decor: 0,
        eventPlanning: 0,
        audioVisual: 0,
        photography: 0,
        privateChef: 0,
        weddingPlanning: 0,
        entertainment: 0,
        bands: 0,
        gospel: 0,
        dj: 0,
        magicians: 0,
        mc: 0,
        singers: 0,
      };

      servicesData?.forEach((service) => {
        const title = service.title.toLowerCase();
        
        if (title.includes("cater")) servicesByCategory.catering++;
        if (title.includes("bak") || title.includes("cake")) servicesByCategory.bakers++;
        if (title.includes("bar") || title.includes("bartend")) servicesByCategory.bartending++;
        if (title.includes("decor") || title.includes("decoration")) servicesByCategory.decor++;
        if (title.includes("event") && title.includes("plan")) servicesByCategory.eventPlanning++;
        if (title.includes("sound") || title.includes("light") || title.includes("audio")) servicesByCategory.audioVisual++;
        if (title.includes("photo") || title.includes("video")) servicesByCategory.photography++;
        if (title.includes("chef") || title.includes("private chef")) servicesByCategory.privateChef++;
        if (title.includes("wedding") && title.includes("plan")) servicesByCategory.weddingPlanning++;
        if (title.includes("entertain") || title.includes("performer")) servicesByCategory.entertainment++;
        if (title.includes("band")) servicesByCategory.bands++;
        if (title.includes("gospel") || title.includes("choir")) servicesByCategory.gospel++;
        if (title.includes("dj") || title.includes("disc jockey")) servicesByCategory.dj++;
        if (title.includes("magic")) servicesByCategory.magicians++;
        if (title.includes("mc") || title.includes("master of ceremony")) servicesByCategory.mc++;
        if (title.includes("sing") || title.includes("vocal")) servicesByCategory.singers++;
      });

      return {
        totalVenues: totalVenues || 0,
        totalServices: totalServices || 0,
        venuesByLocation,
        servicesByCategory,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
