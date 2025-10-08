import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Tafadzwa Mutasa",
      role: "Event Organizer",
      company: "Harare Music Festival",
      content: "ZimEventPro transformed how we sell tickets. Last year's festival sold out in 2 hours instead of 2 weeks. The mobile integration with EcoCash made it accessible to everyone.",
      rating: 5,
      avatar: "TM",
      event: "Music Festival"
    },
    {
      name: "Chipo Mubvumbi", 
      role: "Club Manager",
      company: "Club Sankayi",
      content: "Our VIP table bookings increased 300% since using ZimEventPro. Customers love the instant confirmation and QR code entry. No more guest list confusion!",
      rating: 5,
      avatar: "CM",
      event: "Nightlife"
    },
    {
      name: "James Sibanda",
      role: "Transport Manager", 
      company: "Eagle Liner",
      content: "Bus bookings are now completely digital. Passengers can book from anywhere in Zimbabwe and pay with EcoCash. Our no-shows dropped to almost zero.",
      rating: 5,
      avatar: "JS",
      event: "Transport"
    },
    {
      name: "Memory Chikwanha",
      role: "Frequent Traveler",
      company: "Marketing Executive",
      content: "I use ZimEventPro for everything - flights to Cape Town, bus trips to Vic Falls, concert tickets. Everything in one place, always works perfectly.",
      rating: 5,
      avatar: "MC",
      event: "Customer"
    },
    {
      name: "Blessing Ncube",
      role: "Event Planner",
      company: "Elite Events Zim",
      content: "The analytics dashboard shows us exactly which marketing channels work best. We've optimized our campaigns and tripled our ticket sales efficiency.",
      rating: 5,
      avatar: "BN",
      event: "Business"
    },
    {
      name: "Rutendo Mashonganyika",
      role: "University Student",
      company: "UZ Student",
      content: "Finally, a booking platform that actually works in Zimbabwe! I can book concert tickets even when my data is low. The WhatsApp delivery is genius.",
      rating: 5,
      avatar: "RM",
      event: "Student"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Loved by Zimbabwe
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From Harare to Bulawayo, from small gigs to major events — 
            see why thousands trust ZimEventPro for their bookings.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-primary font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.event}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <Quote className="h-8 w-8 text-primary/20 mb-2" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-primary mb-1">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Would Recommend</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;