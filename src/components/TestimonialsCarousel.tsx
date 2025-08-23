import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Mukamuri",
    role: "Wedding Client",
    location: "Harare",
    rating: 5,
    image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
    text: "ZimEventPro made planning our wedding so easy! Found the perfect venue and vendors all in one place. The team was professional and responsive throughout.",
    event: "Dream Wedding at Rainbow Towers"
  },
  {
    name: "Michael Chivamba", 
    role: "Corporate Event Manager",
    location: "Bulawayo",
    rating: 5,
    image: "/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png",
    text: "Outstanding service for our company's annual conference. The vendors were vetted, professional, and delivered exactly what we needed. Highly recommended!",
    event: "Annual Corporate Conference"
  },
  {
    name: "Grace Ndlovu",
    role: "Birthday Celebration",
    location: "Victoria Falls",
    rating: 5,
    image: "/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png",
    text: "Incredible experience! The photographer and caterer we found through ZimEventPro exceeded all expectations. Our celebration was absolutely perfect.",
    event: "50th Birthday Celebration"
  },
  {
    name: "David Moyo",
    role: "Engagement Party",
    location: "Gweru",
    rating: 5,
    image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png",
    text: "The platform's search features helped us find exactly what we needed within our budget. Great communication and seamless booking process throughout.",
    event: "Romantic Engagement Party"
  }
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-secondary fill-secondary' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gradient">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who have created unforgettable events with ZimEventPro
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main testimonial card */}
          <Card className="card-elegant p-8 md:p-12 text-center relative overflow-hidden group">
            {/* Background quote icon */}
            <Quote className="absolute top-4 left-4 w-12 h-12 text-primary/10 transform -rotate-12" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-lg">
                  <AvatarImage src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex justify-center mb-4">
                {renderStars(testimonials[currentIndex].rating)}
              </div>

              <blockquote className="text-lg md:text-xl text-foreground mb-6 leading-relaxed font-medium">
                "{testimonials[currentIndex].text}"
              </blockquote>

              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-foreground">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
                </p>
                <p className="text-primary text-sm font-medium">
                  {testimonials[currentIndex].event}
                </p>
              </div>
            </div>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-primary shadow-glow-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full hover:bg-primary/10"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Additional social proof */}
        <div className="text-center mt-16 opacity-70">
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by event planners across Zimbabwe
          </p>
          <div className="flex justify-center items-center gap-8 text-xs text-muted-foreground">
            <span>• 4.9/5 Average Rating</span>
            <span>• 15,000+ Events Completed</span>
            <span>• 98% Client Satisfaction</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;