import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Star, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// You'll need to add your Mapbox token to Supabase Edge Function Secrets
const MAPBOX_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN'; // Replace with actual token

interface Service {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: [number, number];
  price_from?: number;
  rating: number;
  category?: { name: string };
  image_url?: string;
}

interface MapViewProps {
  services: Service[];
  onServiceSelect?: (service: Service) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({
  services,
  onServiceSelect,
  className,
  center = [30.4518, -17.8252], // Zimbabwe center coordinates
  zoom = 6
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [isMapTokenValid, setIsMapTokenValid] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: center,
        zoom: zoom,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setIsMapTokenValid(false);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setIsMapTokenValid(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [center, zoom]);

  // Add service markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    services.forEach((service) => {
      if (!service.coordinates) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'service-marker';
      el.innerHTML = `
        <div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      `;

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedService(service);
        onServiceSelect?.(service);
      });

      // Create popup content
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'service-popup'
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-1">${service.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${service.location}</p>
          <div class="flex items-center gap-2 mb-2">
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-xs font-medium">${service.rating}</span>
            </div>
            ${service.price_from ? `<span class="text-xs text-primary font-medium">From $${service.price_from}</span>` : ''}
          </div>
          <div class="text-xs px-2 py-1 bg-gray-100 rounded text-center font-medium">
            Click to view details
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat(service.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [services, mapLoaded, onServiceSelect]);

  // Search location
  const handleLocationSearch = useCallback(async () => {
    if (!searchLocation.trim() || !map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchLocation)}.json?access_token=${MAPBOX_TOKEN}&country=ZW&types=place,locality,neighborhood`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Location search error:', error);
    }
  }, [searchLocation]);

  // Token validation fallback
  if (!isMapTokenValid) {
    return (
      <Card className={cn("h-96 flex items-center justify-center", className)}>
        <CardContent className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map View Unavailable</h3>
          <p className="text-muted-foreground mb-4">
            Please configure your Mapbox token to enable map functionality.
          </p>
          <Badge variant="outline">
            Add MAPBOX_PUBLIC_KEY to Supabase Secrets
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("relative h-96 rounded-lg overflow-hidden", className)}>
      {/* Search overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search location in Zimbabwe..."
            className="bg-white/90 backdrop-blur-sm border-white/20"
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
          />
        </div>
        <Button 
          onClick={handleLocationSearch}
          size="icon"
          className="bg-white/90 backdrop-blur-sm hover:bg-white border-white/20"
          variant="outline"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Service details popup */}
      {selectedService && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-white/95 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{selectedService.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedService(null)}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selectedService.location}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{selectedService.rating}</span>
                  </div>
                  {selectedService.category && (
                    <Badge variant="outline" className="text-xs">
                      {selectedService.category.name}
                    </Badge>
                  )}
                </div>
                
                {selectedService.price_from && (
                  <span className="text-sm font-semibold text-primary">
                    From ${selectedService.price_from}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {selectedService.description}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Service count badge */}
      <div className="absolute top-4 right-20 z-10">
        <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 border-white/20">
          {services.length} services
        </Badge>
      </div>
    </div>
  );
};

export default MapView;