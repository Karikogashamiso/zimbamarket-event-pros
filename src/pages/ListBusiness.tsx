import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Plus,
  Camera,
  Music,
  Utensils,
  Heart,
  DollarSign,
  Clock,
  Shield,
  Award,
  Globe,
  Zap
} from "lucide-react";

const ListBusiness = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    location: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    description: ""
  });

  // Form validation schema
  const businessApplicationSchema = z.object({
    businessName: z.string()
      .trim()
      .min(1, "Business name is required")
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name must be less than 100 characters")
      .regex(/^[a-zA-Z0-9\s&'-]+$/, "Business name contains invalid characters"),
    businessType: z.string()
      .trim()
      .min(1, "Business type is required")
      .max(50, "Business type must be less than 50 characters"),
    location: z.string()
      .trim()
      .min(1, "Location is required")
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location must be less than 100 characters"),
    contactPerson: z.string()
      .trim()
      .min(1, "Contact person is required")
      .min(2, "Contact person name must be at least 2 characters")
      .max(100, "Contact person name must be less than 100 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Contact person name contains invalid characters"),
    phoneNumber: z.string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, "Please enter a valid phone number")
      .max(20, "Phone number must be less than 20 characters"),
    email: z.string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters"),
    description: z.string()
      .trim()
      .min(1, "Business description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters")
  });

  // Validate individual field
  const validateField = (field: string, value: string) => {
    try {
      const fieldSchema = businessApplicationSchema.shape[field as keyof typeof businessApplicationSchema.shape];
      fieldSchema.parse(value);
      
      // Clear error if validation passes
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid input";
        setFormErrors(prev => ({
          ...prev,
          [field]: errorMessage
        }));
      }
      return false;
    }
  };

  // Handle field blur (when user leaves field)
  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validate field on blur
    validateField(field, formData[field as keyof typeof formData]);
  };

  // Handle custom business type modal
  const handleOtherBusinessTypeClick = () => {
    setIsOtherModalOpen(true);
  };

  const handleCustomBusinessTypeSave = () => {
    if (customBusinessType.trim()) {
      setSelectedBusinessType(customBusinessType.trim());
      setFormData(prev => ({
        ...prev,
        businessType: customBusinessType.trim()
      }));
      setIsOtherModalOpen(false);
      toast({
        title: "Custom Business Type Added",
        description: `"${customBusinessType.trim()}" has been selected as your business type.`,
      });
    } else {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid business type.",
        variant: "destructive",
      });
    }
  };

  const handleCustomBusinessTypeCancel = () => {
    setCustomBusinessType("");
    setIsOtherModalOpen(false);
  };

  // Handle business type card selection
  const handleBusinessTypeSelect = (businessType: string) => {
    setSelectedBusinessType(businessType);
    setFormData(prev => ({
      ...prev,
      businessType: businessType
    }));
  };

  // Handle form input changes with validation
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation for touched fields
    if (touchedFields[field]) {
      validateField(field, value);
    }
    
    // Update selected business type when manually typing
    if (field === 'businessType') {
      setSelectedBusinessType(value);
    }
  };

  // Handle form submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mark all fields as touched for validation display
      const allFields = Object.keys(formData);
      setTouchedFields(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

      // Validate all fields
      const validatedData = businessApplicationSchema.parse(formData);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Submit to Supabase
      const { error } = await supabase
        .from('business_applications')
        .insert({
          user_id: user?.id || null,
          business_name: validatedData.businessName,
          business_type: validatedData.businessType,
          location: validatedData.location,
          contact_person: validatedData.contactPerson,
          phone_number: validatedData.phoneNumber,
          email: validatedData.email,
          description: validatedData.description
        });

      if (error) {
        console.error('Submission error:', error);
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your application. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-business-application-confirmation', {
          body: {
            email: validatedData.email,
            businessName: validatedData.businessName,
            contactPerson: validatedData.contactPerson,
            businessType: validatedData.businessType
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't block success if email fails
      }

      // Success
      toast({
        title: "Application Submitted Successfully!",
        description: "Check your email for confirmation. Our team will review your application within 24 hours.",
      });

      // Redirect to service provider dashboard after 2 seconds
      setTimeout(() => {
        navigate('/service-provider');
      }, 2000);

      // Reset form and validation states
      setFormData({
        businessName: "",
        businessType: "",
        location: "",
        contactPerson: "",
        phoneNumber: "",
        email: "",
        description: ""
      });
      
      // Reset selected business type and custom type
      setSelectedBusinessType("");
      setCustomBusinessType("");
      setFormErrors({});
      setTouchedFields({});

      // Redirect to applications page after 2 seconds
      setTimeout(() => {
        window.location.href = '/my-applications';
      }, 2000);

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
        
        // Show first validation error
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        console.error('Unexpected error:', error);
        toast({
          title: "Submission Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to contact form
  const scrollToForm = () => {
    const formSection = document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to benefits section
  const scrollToBenefits = () => {
    const benefitsSection = document.getElementById('benefits');
    if (benefitsSection) {
      benefitsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const benefits = [
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Reach thousands of potential customers actively searching for your services across Zimbabwe."
    },
    {
      icon: Users,
      title: "Verified Listings",
      description: "Join our network of trusted professionals with verified badges and customer reviews."
    },
    {
      icon: DollarSign,
      title: "Flexible Pricing",
      description: "Choose from our affordable subscription plans designed for businesses of all sizes."
    },
    {
      icon: Clock,
      title: "Instant Bookings",
      description: "Accept bookings 24/7 with our automated booking system and calendar management."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid safely and on time with our secure payment processing system."
    },
    {
      icon: Award,
      title: "Marketing Support",
      description: "Featured listings, promotional opportunities, and marketing tools to boost visibility."
    }
  ];

  const businessTypes = [
    { name: "Wedding Venues", icon: Building2, popular: true, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { name: "Conference Centers", icon: Building2, popular: true, color: "bg-gradient-to-br from-indigo-500 to-indigo-600" },
    { name: "Catering Companies", icon: Utensils, popular: true, color: "bg-gradient-to-br from-green-500 to-green-600" },
    { name: "Professional DJs", icon: Music, popular: true, color: "bg-gradient-to-br from-red-500 to-red-600" },
    { name: "Event Photographers", icon: Camera, popular: true, color: "bg-gradient-to-br from-purple-500 to-purple-600" },
    { name: "Wedding Planners", icon: Heart, popular: false, color: "bg-gradient-to-br from-pink-500 to-pink-600" },
    { name: "Event Decorators", icon: Star, popular: false, color: "bg-gradient-to-br from-orange-500 to-orange-600" },
    { name: "Live Bands", icon: Music, popular: false, color: "bg-gradient-to-br from-violet-500 to-violet-600" },
    { name: "Bartending Services", icon: Utensils, popular: false, color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
    { name: "Lighting & Sound", icon: Zap, popular: false, color: "bg-gradient-to-br from-yellow-500 to-yellow-600" },
    { name: "Private Chefs", icon: Utensils, popular: false, color: "bg-gradient-to-br from-teal-500 to-teal-600" },
    { name: "Master of Ceremonies", icon: Users, popular: false, color: "bg-gradient-to-br from-cyan-500 to-cyan-600" },
    { name: "Event Security", icon: Shield, popular: false, color: "bg-gradient-to-br from-gray-500 to-gray-600" },
    { name: "Transportation", icon: Globe, popular: false, color: "bg-gradient-to-br from-slate-500 to-slate-600" }
  ];

  const stats = [
    { number: "500+", label: "Active Vendors" },
    { number: "10,000+", label: "Monthly Visitors" },
    { number: "5,000+", label: "Events Booked" },
    { number: "98%", label: "Customer Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-secondary/10 via-background to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-6 py-2 mb-6">
              <Plus className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Join Our Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
              Own an Events Business or Venue?
            </h1>
            
            <p className="text-2xl md:text-3xl text-secondary font-semibold mb-6">
              List your business on Zimbabwe's best Event Planning Platform today!
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of successful event professionals who are growing their businesses with ZimEventPro. Get discovered by thousands of customers planning their perfect events across Zimbabwe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 h-auto hover-scale" onClick={scrollToForm}>
                <Plus className="w-5 h-5 mr-2" />
                List Your Business Free
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto hover-scale" onClick={scrollToBenefits}>
                <Users className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-scale">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Type of Business Do You Have?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              ZimEventPro welcomes all types of event-related businesses. Whether you're just starting or already established, we have the right plan for you.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {businessTypes.map((business, index) => (
              <Card 
                key={index} 
                className={`text-center hover-scale transition-all duration-300 hover:shadow-xl cursor-pointer group ${
                  selectedBusinessType === business.name 
                    ? 'ring-2 ring-primary bg-primary/5 border-primary shadow-lg' 
                    : 'hover:shadow-xl'
                }`}
                onClick={() => handleBusinessTypeSelect(business.name)}
              >
                <CardContent className="p-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                      selectedBusinessType === business.name 
                        ? 'bg-gradient-to-br from-primary to-primary/80 scale-110' 
                        : business.color
                    }`}>
                      <business.icon className="w-8 h-8 text-white" />
                    </div>
                    {business.popular && (
                      <Badge className={`absolute -top-2 -right-2 ${
                        selectedBusinessType === business.name 
                          ? 'bg-primary text-white' 
                          : 'bg-secondary text-white'
                      }`}>
                        Popular
                      </Badge>
                    )}
                    {selectedBusinessType === business.name && (
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-semibold transition-colors ${
                    selectedBusinessType === business.name 
                      ? 'text-primary' 
                      : 'group-hover:text-primary'
                  }`}>
                    {business.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Don't see your business type? No problem! We welcome all event-related services.
            </p>
            
            <Dialog open={isOtherModalOpen} onOpenChange={setIsOtherModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="hover-scale"
                  onClick={handleOtherBusinessTypeClick}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Other Business Types
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-background border shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Add Custom Business Type</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        What type of business do you have? *
                      </label>
                      <Input
                        placeholder="e.g., Mobile Bar Service, Photo Booth Rental, Event Lighting..."
                        value={customBusinessType}
                        onChange={(e) => setCustomBusinessType(e.target.value)}
                        className="w-full"
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Be specific about your services (max 50 characters)
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCustomBusinessTypeCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCustomBusinessTypeSave}
                    disabled={!customBusinessType.trim()}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Business Type
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {selectedBusinessType && !businessTypes.some(bt => bt.name === selectedBusinessType) && (
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Custom Business Type Selected</p>
                    <p className="text-sm text-muted-foreground">"{selectedBusinessType}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Partner with ZimEventPro?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join Zimbabwe's fastest-growing event marketplace and take your business to the next level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover-scale transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below and our team will contact you within 24 hours to set up your business listing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleSubmitApplication} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Business Name *</label>
                        <Input 
                          placeholder="Your Business Name"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          onBlur={() => handleFieldBlur('businessName')}
                          className={`${
                            touchedFields.businessName && formErrors.businessName 
                              ? 'border-destructive focus:border-destructive' 
                              : ''
                          }`}
                          required
                        />
                        {touchedFields.businessName && formErrors.businessName && (
                          <p className="text-xs text-destructive mt-1">{formErrors.businessName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Business Type *</label>
                        <Input 
                          placeholder="e.g., Wedding Venue"
                          value={formData.businessType}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          onBlur={() => handleFieldBlur('businessType')}
                          className={`${
                            touchedFields.businessType && formErrors.businessType 
                              ? 'border-destructive focus:border-destructive' 
                              : ''
                          }`}
                          required
                        />
                        {selectedBusinessType && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Selected: {selectedBusinessType}
                          </p>
                        )}
                        {touchedFields.businessType && formErrors.businessType && (
                          <p className="text-xs text-destructive mt-1">{formErrors.businessType}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location *</label>
                      <Input 
                        placeholder="City, Zimbabwe"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        onBlur={() => handleFieldBlur('location')}
                        className={`${
                          touchedFields.location && formErrors.location 
                            ? 'border-destructive focus:border-destructive' 
                            : ''
                        }`}
                        required
                      />
                      {touchedFields.location && formErrors.location && (
                        <p className="text-xs text-destructive mt-1">{formErrors.location}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Person *</label>
                        <Input 
                          placeholder="Your Name"
                          value={formData.contactPerson}
                          onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                          onBlur={() => handleFieldBlur('contactPerson')}
                          className={`${
                            touchedFields.contactPerson && formErrors.contactPerson 
                              ? 'border-destructive focus:border-destructive' 
                              : ''
                          }`}
                          required
                        />
                        {touchedFields.contactPerson && formErrors.contactPerson && (
                          <p className="text-xs text-destructive mt-1">{formErrors.contactPerson}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                        <Input 
                          placeholder="+263 XX XXX XXXX"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          onBlur={() => handleFieldBlur('phoneNumber')}
                          className={`${
                            touchedFields.phoneNumber && formErrors.phoneNumber 
                              ? 'border-destructive focus:border-destructive' 
                              : ''
                          }`}
                          required
                        />
                        {touchedFields.phoneNumber && formErrors.phoneNumber && (
                          <p className="text-xs text-destructive mt-1">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address *</label>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        className={`${
                          touchedFields.email && formErrors.email 
                            ? 'border-destructive focus:border-destructive' 
                            : ''
                        }`}
                        required
                      />
                      {touchedFields.email && formErrors.email && (
                        <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tell us about your business *</label>
                      <Textarea 
                        placeholder="Describe your services, experience, and what makes your business special..."
                        className={`min-h-32 ${
                          touchedFields.description && formErrors.description 
                            ? 'border-destructive focus:border-destructive' 
                            : ''
                        }`}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        onBlur={() => handleFieldBlur('description')}
                        required
                      />
                      <div className="flex justify-between items-center mt-1">
                        {touchedFields.description && formErrors.description ? (
                          <p className="text-xs text-destructive">{formErrors.description}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Min 10 characters required
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length}/1000
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full text-lg py-3 h-auto"
                      disabled={isSubmitting || Object.keys(formErrors).length > 0}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="space-y-8">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Application Review</h4>
                        <p className="text-sm text-muted-foreground">We'll review your application within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Profile Setup</h4>
                        <p className="text-sm text-muted-foreground">Our team will help you create your perfect listing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Go Live</h4>
                        <p className="text-sm text-muted-foreground">Start receiving bookings from customers</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-8 bg-gradient-to-r from-secondary to-primary text-white">
                  <h3 className="text-2xl font-bold mb-4">Special Launch Offer</h3>
                  <p className="mb-4 opacity-90">
                    Join ZimEventPro today and get your first 3 months absolutely FREE!
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">Limited time offer for new partners</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListBusiness;