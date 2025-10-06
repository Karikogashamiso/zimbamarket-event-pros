import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Phone, 
  Mail,
  Heart,
  Share2,
  Flag,
  CheckCircle,
  Camera,
  ArrowLeft,
  ArrowRight,
  Award,
  Shield,
  MessageSquare,
  Send,
  ThumbsUp
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useService } from "@/hooks/useServices";
import { useReviews } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ServiceDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  
  const { service, loading: serviceLoading, error: serviceError } = useService(id || '');
  const { reviews, loading: reviewsLoading } = useReviews(id || '');
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!service) return;
    
    setIsBookingLoading(true);
    
    try {
      const bookingData = {
        service_id: service.id,
        event_date: selectedDate || null,
        message: message || null,
        ...(user ? {
          user_id: user.id,
        } : {
          guest_name: '', // Will be handled by a form if user is not logged in
          guest_email: '',
          guest_phone: '',
        })
      };

      const { error } = await supabase
        .from('booking_requests')
        .insert(bookingData);

      if (error) {
        throw error;
      }

      toast({
        title: "Inquiry sent!",
        description: "Your booking inquiry has been sent successfully. The service provider will contact you soon.",
      });

      // Reset form
      setSelectedDate('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading service details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <p className="text-muted-foreground mb-4">The service you're looking for doesn't exist or has been removed.</p>
            <Link to="/search">
              <Button>Browse Other Services</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get service images - fallback to default if none exist
  const serviceImages = service.image_url ? [service.image_url] : ["/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png"];
  
  // Mock packages for now - in a real app this would come from the database
  const packages = [
    {
      name: "Basic Package",
      description: "Essential services",
      guests: `Up to ${service.capacity_min || 50} guests`,
      price: `$${service.price_from || 500}`,
      includes: ["Basic service", "Standard setup", "Support included"]
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
  };

  return (
    <>
      <Helmet>
        <title>{service.title} - {service.category?.name} | ZimEventPro</title>
        <meta name="description" content={service.description} />
        <meta property="og:title" content={`${service.title} - ${service.category?.name}`} />
        <meta property="og:description" content={service.description} />
        <meta property="og:image" content={serviceImages[0]} />
      </Helmet>

      <div className="min-h-screen bg-background">
        
        {/* Breadcrumb */}
        <section className="py-4 border-b">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link to="/categories" className="hover:text-primary">Categories</Link>
              <span>/</span>
              <Link to="/search" className="hover:text-primary">{service.category?.name}</Link>
              <span>/</span>
              <span className="text-foreground">{service.title}</span>
            </nav>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Image Gallery */}
                <div className="relative">
                  <div className="relative h-96 rounded-2xl overflow-hidden">
                    <img 
                      src={serviceImages[currentImageIndex]} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Buttons */}
                    {serviceImages.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {serviceImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {serviceImages.length > 1 && (
                    <div className="flex gap-2 mt-4">
                      {serviceImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            currentImageIndex === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{service.category?.name}</Badge>
                      {service.verified && (
                        <Badge className="bg-primary">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {service.featured && (
                        <Badge className="bg-secondary">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-4xl font-bold mb-4 font-display">{service.title}</h1>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-muted-foreground">({service.review_count} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {service.location}
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Tabs Content */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="packages">Packages</TabsTrigger>
                      <TabsTrigger value="amenities">Amenities</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6 mt-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-4">About This Service</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {service.full_description || service.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Users className="w-6 h-6 text-primary" />
                              <h4 className="font-semibold">Capacity</h4>
                            </div>
                            <p className="text-muted-foreground">
                              {service.capacity_min && service.capacity_max 
                                ? `${service.capacity_min}-${service.capacity_max} guests`
                                : service.capacity_min 
                                ? `Up to ${service.capacity_min} guests`
                                : 'Capacity varies'
                              }
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Clock className="w-6 h-6 text-primary" />
                              <h4 className="font-semibold">Response Time</h4>
                            </div>
                            <p className="text-muted-foreground">{service.response_time}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="packages" className="space-y-6 mt-6">
                      <h3 className="text-2xl font-bold">Service Packages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg, index) => (
                          <Card key={index} className="hover-lift">
                            <CardHeader>
                              <CardTitle>{pkg.name}</CardTitle>
                              <p className="text-muted-foreground">{pkg.description}</p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <p className="font-semibold text-lg">{pkg.price}</p>
                                  <p className="text-sm text-muted-foreground">{pkg.guests}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Includes:</h4>
                                  <ul className="space-y-1">
                                    {pkg.includes.map((item, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="amenities" className="space-y-6 mt-6">
                      <h3 className="text-2xl font-bold">Service Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(service.amenities || []).map((amenity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {(!service.amenities || service.amenities.length === 0) && (
                          <p className="text-muted-foreground col-span-full">No specific amenities listed.</p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="space-y-6 mt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">Customer Reviews</h3>
                        <Button variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {reviewsLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-muted-foreground">Loading reviews...</p>
                          </div>
                        ) : reviews.length > 0 ? (
                          reviews.map((review) => (
                          <Card key={review.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{review.reviewer_name}</h4>
                                    <div className="flex">
                                      {Array.from({ length: review.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-4">{review.comment}</p>
                              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpful_count || 0})
                              </button>
                            </CardContent>
                          </Card>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No reviews yet.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  
                  {/* Booking Card */}
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="text-3xl font-bold text-primary mb-2">
                          {service.price_from ? `From $${service.price_from}` : 'Contact for pricing'}
                          {service.price_unit && <span className="text-lg">/{service.price_unit}</span>}
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {service.availability_status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                          <Input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Message</label>
                          <Textarea 
                            placeholder="Tell us about your event..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <Button 
                          className="w-full text-lg py-3 h-auto" 
                          onClick={handleBookingSubmit}
                          disabled={isBookingLoading}
                        >
                          <Send className="w-5 h-5 mr-2" />
                          {isBookingLoading ? "Sending..." : "Send Inquiry"}
                        </Button>
                        
                        <Button variant="outline" className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check Availability
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Contact Info */}
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      {service.phone_number && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <a href={`tel:${service.phone_number}`} className="hover:text-primary">
                            {service.phone_number}
                          </a>
                        </div>
                      )}
                      {service.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <a href={`mailto:${service.email}`} className="hover:text-primary">
                            {service.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-sm">{service.address || service.location}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Actions */}
                  <Card className="p-6">
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="icon">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default ServiceDetail;