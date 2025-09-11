import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Clock, Users, Plane, Bus, Music, Trophy } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'event' | 'transport';
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price_from: number;
  currency: string;
  capacity: number;
  available: number;
  image: string;
  featured: boolean;
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Harare Music Festival 2024',
    type: 'event',
    category: 'music',
    date: '2024-02-15',
    time: '18:00',
    venue: 'Rainbow Towers',
    location: 'Harare',
    price_from: 25,
    currency: 'USD',
    capacity: 5000,
    available: 2500,
    image: '/placeholder-event.jpg',
    featured: true
  },
  {
    id: '2', 
    title: 'Harare to Bulawayo Express',
    type: 'transport',
    category: 'bus',
    date: '2024-02-16',
    time: '06:00',
    venue: 'City Terminal',
    location: 'Harare → Bulawayo',
    price_from: 15,
    currency: 'USD',
    capacity: 50,
    available: 32,
    image: '/placeholder-bus.jpg',
    featured: false
  },
  {
    id: '3',
    title: 'FC Platinum vs Dynamos',
    type: 'event', 
    category: 'sports',
    date: '2024-02-17',
    time: '15:00',
    venue: 'National Sports Stadium',
    location: 'Harare',
    price_from: 5,
    currency: 'USD',
    capacity: 60000,
    available: 45000,
    image: '/placeholder-sports.jpg',
    featured: false
  }
];

interface EventSelectionProps {
  onEventSelect: (event: Event) => void;
  selectedEvent?: Event;
}

export const EventSelection: React.FC<EventSelectionProps> = ({
  onEventSelect,
  selectedEvent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'events' && event.type === 'event') ||
                      (activeTab === 'transport' && event.type === 'transport');
    return matchesSearch && matchesTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'sports': return <Trophy className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'flight': return <Plane className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatAvailability = (available: number, capacity: number) => {
    const percentage = (available / capacity) * 100;
    if (percentage > 80) return { color: 'bg-green-500', text: 'Good availability' };
    if (percentage > 50) return { color: 'bg-yellow-500', text: 'Limited availability' };
    if (percentage > 20) return { color: 'bg-orange-500', text: 'Few seats left' };
    return { color: 'bg-red-500', text: 'Almost sold out' };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <Input
          placeholder="Search events or destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const availability = formatAvailability(event.available, event.capacity);
          const isSelected = selectedEvent?.id === event.id;

          return (
            <Card
              key={event.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              } ${event.featured ? 'border-primary' : ''}`}
              onClick={() => onEventSelect(event)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Event Image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(event.category)}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base leading-tight">
                        {event.title}
                      </h3>
                      {event.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Location and Date */}
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Availability */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          {event.currency === 'USD' ? '$' : event.currency === 'ZWL' ? 'Z$' : 'RTGS$'}
                          {event.price_from}
                        </span>
                        <span className="text-xs text-muted-foreground">from</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${availability.color}`} />
                        <span className="text-muted-foreground">
                          {event.available} of {event.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No events found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};