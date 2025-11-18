import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Star } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { Link } from "react-router-dom";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import { Skeleton } from "@/components/ui/skeleton";

const VenuesSection = () => {
  const { listings: venues, loading } = useBusinessListings({ 
    category: 'venues',
    featured: true,
    requireServices: false
  });
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Premium Venues & Hotels
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover Zimbabwe's finest venues and hotels for your next event
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))
          ) : (
            venues.map((venue) => (
              <Card 
                key={venue.id} 
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  <LazyImage
                    src={venue.images && venue.images.length > 0 ? venue.images[0] : '/placeholder.svg'}
                    alt={venue.business_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-xs font-semibold">4.8</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{venue.business_name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{venue.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Up to {venue.capacity_max} guests</span>
                    </div>
                    {venue.price_from && (
                      <div className="text-xs text-primary font-medium">
                        From ${venue.price_from} {venue.price_unit}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/business/${venue.id}`}
                    className="mt-4 w-full inline-block text-center py-2 px-4 bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-md transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/search?category=venues"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Explore All Venues
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VenuesSection;
