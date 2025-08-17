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

const ServiceDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');

  // Mock service data
  const service = {
    id: 1,
    title: "Royal Gardens Wedding Venue",
    category: "Wedding Venue",
    location: "Harare, Zimbabwe",
    address: "123 Garden Avenue, Highlands, Harare",
    description: "Experience the magic of your special day at Royal Gardens, Zimbabwe's premier wedding venue. Set within beautifully manicured gardens with stunning views of the city, our venue offers the perfect blend of elegance and natural beauty for your dream wedding.",
    fullDescription: "Royal Gardens Wedding Venue is an exquisite destination that combines sophistication with natural beauty. Our venue features multiple ceremony locations, from intimate garden settings to grand outdoor pavilions. The main reception hall can accommodate up to 200 guests and features floor-to-ceiling windows that flood the space with natural light during the day and offer romantic ambiance in the evening. Our professional team handles every detail, from décor setup to catering coordination, ensuring your wedding day is flawless.",
    price: "From $500",
    rating: 4.9,
    reviews: 127,
    images: [
      "/lovable-uploads/e49bac6e-5130-4e8d-aa17-17dc70c87e04.png",
      "/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png",
      "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png"
    ],
    verified: true,
    featured: true,
    availability: "Available",
    responseTime: "Usually responds within 2 hours",
    capacity: "50-200 guests",
    phoneNumber: "+263 4 123 4567",
    email: "info@royalgardens.co.zw",
    website: "www.royalgardens.co.zw",
    amenities: [
      "Bridal Suite",
      "Parking for 100+ cars",
      "Professional Lighting",
      "Sound System",
      "Catering Kitchen",
      "Garden Ceremony Space",
      "Reception Hall",
      "Photography Areas"
    ],
    packages: [
      {
        name: "Intimate Package",
        description: "Perfect for smaller celebrations",
        guests: "Up to 50 guests",
        price: "$500",
        includes: ["4-hour venue rental", "Basic sound system", "Bridal suite access"]
      },
      {
        name: "Classic Package",
        description: "Our most popular wedding package",
        guests: "Up to 150 guests",
        price: "$800",
        includes: ["8-hour venue rental", "Full sound & lighting", "Bridal suite", "Ceremony décor", "Coordinator"]
      },
      {
        name: "Premium Package",
        description: "The ultimate wedding experience",
        guests: "Up to 200 guests",
        price: "$1200",
        includes: ["Full day venue rental", "Premium sound & lighting", "Bridal & groom suites", "Full décor package", "Wedding coordinator", "Photography areas"]
      }
    ]
  };

  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Absolutely magical venue! The gardens are breathtaking and the staff went above and beyond to make our wedding day perfect. Highly recommend!",
      helpful: 12
    },
    {
      id: 2,
      name: "David & Jane K.",
      rating: 5,
      date: "1 month ago",
      comment: "Royal Gardens exceeded all our expectations. The venue is stunning, the service is impeccable, and our guests are still talking about how beautiful everything was.",
      helpful: 8
    },
    {
      id: 3,
      name: "Michael T.",
      rating: 4,
      date: "2 months ago",
      comment: "Great venue with excellent facilities. The only minor issue was parking during peak season, but the staff managed it well. Overall very satisfied.",
      helpful: 5
    }
  ];

  const relatedServices = [
    {
      id: 2,
      title: "Premium African Cuisine Catering",
      category: "Catering",
      location: "Harare, Zimbabwe",
      price: "From $25/person",
      rating: 4.8,
      image: "/lovable-uploads/e2d79037-25f0-47c6-9c14-4a3674ff7ce6.png"
    },
    {
      id: 3,
      title: "Elegant Events Photography",
      category: "Photography",
      location: "Harare, Zimbabwe",
      price: "From $300",
      rating: 4.9,
      image: "/lovable-uploads/2735172f-d339-4f7b-b058-3787764bf6af.png"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % service.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + service.images.length) % service.images.length);
  };

  return (
    <>
      <Helmet>
        <title>{service.title} - {service.category} | ZimEventPro</title>
        <meta name="description" content={service.description} />
        <meta property="og:title" content={`${service.title} - ${service.category}`} />
        <meta property="og:description" content={service.description} />
        <meta property="og:image" content={service.images[0]} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Spacer */}
        <div className="h-20"></div>
        
        {/* Breadcrumb */}
        <section className="py-4 border-b">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link to="/categories" className="hover:text-primary">Categories</Link>
              <span>/</span>
              <Link to="/search" className="hover:text-primary">{service.category}</Link>
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
                      src={service.images[currentImageIndex]} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Buttons */}
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
                      {currentImageIndex + 1} / {service.images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  <div className="flex gap-2 mt-4">
                    {service.images.map((image, index) => (
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
                </div>

                {/* Service Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{service.category}</Badge>
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
                        <span className="text-muted-foreground">({service.reviews} reviews)</span>
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
                        <h3 className="text-2xl font-bold mb-4">About This Venue</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {service.fullDescription}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Users className="w-6 h-6 text-primary" />
                              <h4 className="font-semibold">Capacity</h4>
                            </div>
                            <p className="text-muted-foreground">{service.capacity}</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Clock className="w-6 h-6 text-primary" />
                              <h4 className="font-semibold">Response Time</h4>
                            </div>
                            <p className="text-muted-foreground">{service.responseTime}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="packages" className="space-y-6 mt-6">
                      <h3 className="text-2xl font-bold">Wedding Packages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {service.packages.map((pkg, index) => (
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
                      <h3 className="text-2xl font-bold">Venue Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {service.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <span>{amenity}</span>
                          </div>
                        ))}
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
                        {reviews.map((review) => (
                          <Card key={review.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{review.name}</h4>
                                    <div className="flex">
                                      {Array.from({ length: review.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{review.date}</p>
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-4">{review.comment}</p>
                              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpful})
                              </button>
                            </CardContent>
                          </Card>
                        ))}
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
                        <div className="text-3xl font-bold text-primary mb-2">{service.price}</div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {service.availability}
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
                        
                        <Button className="w-full text-lg py-3 h-auto">
                          <Send className="w-5 h-5 mr-2" />
                          Send Inquiry
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
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <a href={`tel:${service.phoneNumber}`} className="hover:text-primary">
                          {service.phoneNumber}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <a href={`mailto:${service.email}`} className="hover:text-primary">
                          {service.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-sm">{service.address}</span>
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

        {/* Related Services */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((related) => (
                <Card key={related.id} className="hover-lift overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={related.image} 
                      alt={related.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-2">{related.category}</Badge>
                    <h3 className="font-bold text-lg mb-2">{related.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{related.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{related.rating}</span>
                      </div>
                      <span className="font-bold text-primary">{related.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServiceDetail;