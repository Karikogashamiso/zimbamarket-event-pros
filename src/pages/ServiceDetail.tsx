import React, { useState, useEffect } from "react";
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
import { z } from "zod";
import { ReviewModal } from "@/components/Modals/ReviewModal";
import { AvailabilityModal } from "@/components/Modals/AvailabilityModal";
import { ReportModal } from "@/components/Modals/ReportModal";
import { ServiceImageGallery } from "@/components/ImageGallery/ServiceImageGallery";
import { useServiceActions } from "@/hooks/useServiceActions";
import { ServiceErrorBoundary, SectionErrorBoundary } from "@/components/ErrorBoundary";

// Booking form validation schema
const guestBookingSchema = z.object({
  selectedDate: z.string().optional(),
  message: z.string().max(1000, "Message must be less than 1000 characters").optional(),
  guestName: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  guestEmail: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  guestPhone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
});

const userBookingSchema = z.object({
  selectedDate: z.string().optional(),
  message: z.string().max(1000, "Message must be less than 1000 characters").optional(),
});

const ServiceDetail = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  
  const { service, loading: serviceLoading, error: serviceError } = useService(id || '');
  const { reviews, loading: reviewsLoading } = useReviews(id || '');
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveService, shareService, reportService, isSaving, isReporting } = useServiceActions();

  // Check if service is saved
  useEffect(() => {
    if (service?.id) {
      const savedServices = localStorage.getItem('savedServices');
      if (savedServices) {
        const saved = JSON.parse(savedServices);
        setIsSaved(saved.includes(service.id));
      }
    }
  }, [service?.id]);

  // Handle reviews refresh
  const handleReviewSubmitted = () => {
    // Simple refresh by reloading the component
    window.location.reload();
  };

  // Handle review helpful button
  const handleReviewHelpful = async (reviewId: string) => {
    if (likedReviews.has(reviewId)) {
      toast({
        title: "Already Marked",
        description: "You've already marked this review as helpful.",
      });
      return;
    }

    try {
      // Get current review
      const currentReview = reviews.find(r => r.id === reviewId);
      if (!currentReview) return;

      // Increment helpful count
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: (currentReview.helpful_count || 0) + 1 })
        .eq('id', reviewId);

      if (error) throw error;

      setLikedReviews(prev => new Set(prev).add(reviewId));
      toast({
        title: "Thank you!",
        description: "Your feedback has been recorded.",
      });
      
      // Refresh the page to show updated count
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast({
        title: "Error",
        description: "Failed to record your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle field blur for validation
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // Validate form data
  const validateForm = () => {
    try {
      if (!service || !service.id) {
        throw new Error("Service information is missing");
      }

      if (user) {
        // Validate authenticated user form
        userBookingSchema.parse({
          selectedDate,
          message: message.trim(),
        });
      } else {
        // Validate guest user form
        guestBookingSchema.parse({
          selectedDate,
          message: message.trim(),
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || undefined,
        });
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!service) {
      toast({
        title: "Error",
        description: "Service information is missing. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if user owns this service (prevent self-booking)
    if (user) {
      const { data: businessCheck } = await supabase
        .from('services')
        .select('business_listings!inner(user_id)')
        .eq('id', service.id)
        .single();

      if (businessCheck?.business_listings?.user_id === user.id) {
        toast({
          title: "Cannot Book Own Service",
          description: "Service providers cannot create booking requests for their own services.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsBookingLoading(true);
    
    try {
      // Prepare booking data
      const bookingData: any = {
        service_id: service.id,
        event_date: selectedDate || null,
        message: message.trim() || null,
      };

      // Add user-specific data
      if (user) {
        bookingData.user_id = user.id;
      } else {
        // Guest user data
        bookingData.guest_name = guestName.trim();
        bookingData.guest_email = guestEmail.trim().toLowerCase();
        bookingData.guest_phone = guestPhone.trim() || null;
      }

      console.log('Submitting booking data:', {
        ...bookingData,
        guest_email: bookingData.guest_email ? '[REDACTED]' : undefined
      });

      // Insert booking request
      const { data, error } = await supabase
        .from('booking_requests')
        .insert(bookingData)
        .select('id, status, created_at');

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to submit booking request';
        if (error.code === '23503') {
          errorMessage = 'Invalid service reference. Please refresh the page and try again.';
        } else if (error.code === '42501') {
          errorMessage = 'Permission denied. Please make sure you have the necessary permissions.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Booking request created successfully:', data);

      toast({
        title: "Inquiry sent!",
        description: "Your booking inquiry has been sent successfully. The service provider will contact you soon.",
      });

      // Reset form
      setSelectedDate('');
      setMessage('');
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setErrors({});
      setTouchedFields({});
      
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to submit booking inquiry. Please try again or contact support.",
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

  // Get service images from the new images array with fallback
  const getServiceImages = () => {
    // Use the new images array if available and not empty
    if (service.images && Array.isArray(service.images) && service.images.length > 0) {
      return service.images.filter((img: string) => img && img.trim() !== '');
    }
    
    // Fallback to single image_url if images array is not available
    if (service.image_url && service.image_url.trim() !== '') {
      return [service.image_url];
    }
    
    // Final fallback to default image
    return ["/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png"];
  };

  const serviceImages = getServiceImages();

  // Handle save/unsave with visual feedback
  const handleSaveService = async () => {
    if (!service) return;
    
    const savedServices = localStorage.getItem('savedServices');
    let saved = savedServices ? JSON.parse(savedServices) : [];
    
    if (isSaved) {
      // Remove from saved
      saved = saved.filter((id: string) => id !== service.id);
      setIsSaved(false);
      toast({
        title: "Removed from favorites",
        description: `${service.title} has been removed from your favorites.`,
      });
    } else {
      // Add to saved
      saved.push(service.id);
      setIsSaved(true);
      toast({
        title: "Added to favorites",
        description: `${service.title} has been added to your favorites.`,
      });
    }
    
    localStorage.setItem('savedServices', JSON.stringify(saved));
  };

  return (
    <ServiceErrorBoundary serviceId={id}>
      <Helmet>
        <title>{service.title} - {service.category?.name} | ZimEventPro</title>
        <meta name="description" content={service.description} />
        <meta property="og:title" content={`${service.title} - ${service.category?.name}`} />
        <meta property="og:description" content={service.description} />
        <meta property="og:image" content={serviceImages[0]} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Spacer */}
        <div className="h-20"></div>
        
        {/* Breadcrumb */}
        <SectionErrorBoundary sectionName="breadcrumb navigation" showRetry={false}>
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
        </SectionErrorBoundary>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Enhanced Image Gallery */}
                <SectionErrorBoundary sectionName="image gallery">
                  <ServiceImageGallery 
                    images={serviceImages}
                    serviceName={service.title}
                    className="w-full"
                  />
                </SectionErrorBoundary>

                {/* Service Details */}
                <SectionErrorBoundary sectionName="service details">
                  <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{service.category?.name}</Badge>
                      {service.is_verified && (
                        <Badge className="bg-primary">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {service.is_featured && (
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
                        <span className="font-semibold">{service.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-muted-foreground">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
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
                            <p className="text-muted-foreground">Within 24 hours</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="packages" className="space-y-6 mt-6">
                      <h3 className="text-2xl font-bold">Service Packages</h3>
                      <Card>
                        <CardHeader>
                          <CardTitle>Standard Service</CardTitle>
                          <p className="text-muted-foreground">Customizable to your needs</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="font-semibold text-2xl text-primary">
                                {service.price_from ? `From $${service.price_from}` : 'Custom Pricing'}
                                {service.price_unit && <span className="text-lg">/{service.price_unit}</span>}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.capacity_min && service.capacity_max 
                                  ? `${service.capacity_min}-${service.capacity_max} guests`
                                  : service.capacity_min 
                                  ? `Up to ${service.capacity_min} guests`
                                  : 'Flexible capacity'
                                }
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">What's Included:</h4>
                              <p className="text-sm text-muted-foreground">
                                Contact the service provider for detailed package information and customization options.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                        <ReviewModal 
                          serviceId={service.id}
                          serviceName={service.title}
                          onReviewSubmitted={handleReviewSubmitted}
                        />
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
                              <button 
                                onClick={() => handleReviewHelpful(review.id)}
                                disabled={likedReviews.has(review.id)}
                                className={`flex items-center gap-2 text-sm transition-colors ${
                                  likedReviews.has(review.id) 
                                    ? 'text-primary cursor-not-allowed' 
                                    : 'text-muted-foreground hover:text-primary cursor-pointer'
                                }`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${likedReviews.has(review.id) ? 'fill-primary' : ''}`} />
                                {likedReviews.has(review.id) ? 'Marked as Helpful' : 'Helpful'} ({review.helpful_count || 0})
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
                </SectionErrorBoundary>
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
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available for Booking
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Guest user contact information */}
                        {!user && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Your Name *</label>
                              <Input 
                                type="text"
                                placeholder="Full name"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                onBlur={() => handleFieldBlur('guestName')}
                                className={errors.guestName || (touchedFields.guestName && !guestName.trim()) ? 'border-destructive' : ''}
                              />
                              {(errors.guestName || (touchedFields.guestName && !guestName.trim())) && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors.guestName || 'Name is required'}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Email Address *</label>
                              <Input 
                                type="email"
                                placeholder="your@email.com"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                onBlur={() => handleFieldBlur('guestEmail')}
                                className={errors.guestEmail || (touchedFields.guestEmail && !guestEmail.trim()) ? 'border-destructive' : ''}
                              />
                              {(errors.guestEmail || (touchedFields.guestEmail && !guestEmail.trim())) && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors.guestEmail || 'Email is required'}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Phone Number</label>
                              <Input 
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={guestPhone}
                                onChange={(e) => setGuestPhone(e.target.value)}
                                onBlur={() => handleFieldBlur('guestPhone')}
                                className={errors.guestPhone ? 'border-destructive' : ''}
                              />
                              {errors.guestPhone && (
                                <p className="text-sm text-destructive mt-1">{errors.guestPhone}</p>
                              )}
                            </div>
                          </>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                          <Input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
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
                        
                        <AvailabilityModal 
                          serviceId={service.id}
                          serviceName={service.title}
                          basePrice={service.price_from}
                        />
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
                      <Button 
                        variant="outline" 
                        className={`flex-1 transition-all ${isSaved ? 'border-primary text-primary' : ''}`}
                        onClick={handleSaveService}
                      >
                        <Heart className={`w-4 h-4 mr-2 transition-all ${isSaved ? 'fill-primary' : ''}`} />
                        {isSaved ? "Saved" : "Save"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => shareService(service.id, service.title)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <ReportModal 
                        onReport={(reason) => reportService(service.id, service.title, reason)}
                        isReporting={isReporting}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </ServiceErrorBoundary>
  );
};

export default ServiceDetail;