import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';
import { 
  sanitizeContactData, 
  logContactFormAnalytics, 
  verifyContactFormIntegration 
} from "@/utils/contactFormValidation";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [integrationStatus, setIntegrationStatus] = useState<string>('Checking...');
  const { toast } = useToast();
  const { makeSupabaseRequest } = useAuthenticatedRequest();

  // Verify backend integration on component mount
  useEffect(() => {
    const checkIntegration = async () => {
      try {
        const verification = await verifyContactFormIntegration();
        if (verification.isConnected && verification.canInsert) {
          setIntegrationStatus(`✅ Backend Connected - Last submission: ${verification.latestSubmission}`);
        } else {
          setIntegrationStatus(`❌ Integration Issue: ${verification.error}`);
          console.error('Contact form integration issue:', verification.error);
        }
      } catch (error) {
        setIntegrationStatus('❌ Integration verification failed');
        console.error('Integration check failed:', error);
      }
    };

    checkIntegration();
  }, []);

  // Form validation schema
  const contactSchema = z.object({
    firstName: z.string()
      .trim()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "First name contains invalid characters"),
    
    lastName: z.string()
      .trim()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Last name contains invalid characters"),
    
    email: z.string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters"),
    
    phone: z.string()
      .trim()
      .optional()
      .refine((val) => !val || /^[\+]?[0-9\s\-\(\)]{7,20}$/.test(val), {
        message: "Please enter a valid phone number"
      }),
    
    subject: z.string()
      .trim()
      .min(1, "Subject is required")
      .min(5, "Subject must be at least 5 characters")
      .max(200, "Subject must be less than 200 characters"),
    
    message: z.string()
      .trim()
      .min(1, "Message is required")
      .min(10, "Message must be at least 10 characters")
      .max(2000, "Message must be less than 2000 characters")
  });

  const validateField = (fieldName: string, value: string) => {
    try {
      const fieldSchema = contactSchema.shape[fieldName as keyof typeof contactSchema.shape];
      fieldSchema.parse(value);
      
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors(prev => ({
          ...prev,
          [fieldName]: error.errors[0].message
        }));
      }
      return false;
    }
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    const formData = new FormData(e.target as HTMLFormElement);
    const submitData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      // Validate all fields
      const validatedData = contactSchema.parse(submitData);

      console.log('Submitting contact form:', {
        firstName: validatedData.firstName,
        email: validatedData.email,
        subject: validatedData.subject,
        messageLength: validatedData.message.length,
        timestamp: new Date().toISOString()
      });

      // Check rate limiting with CSRF protection
      const rateLimitResponse = await makeSupabaseRequest('rate-limiter', {
        action: 'contact_form',
        identifier: validatedData.email,
        additionalData: {
          email: validatedData.email,
          userAgent: navigator.userAgent
        }
      });

      if (rateLimitResponse.error || !rateLimitResponse.data?.allowed) {
        const errorMessage = rateLimitResponse.data?.message || 'Rate limit exceeded. Please try again later.';
        toast({
          title: "Too many attempts",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Sanitize data for database insertion
      const sanitizedData = sanitizeContactData({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message
      });

      // Insert into Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert(sanitizedData);

      if (error) {
        console.error('Supabase insertion error:', error);
        await logContactFormAnalytics(false, error.code || 'database_error');
        
        // Handle specific Supabase errors
        if (error.message.includes('violates row-level security')) {
          throw new Error('Permission denied. Please try again or contact support.');
        } else if (error.message.includes('duplicate key')) {
          throw new Error('A message with this content already exists.');
        } else {
          throw new Error(error.message || 'Failed to submit form');
        }
      }

      // Success logging
      console.log('Contact form submitted successfully');
      await logContactFormAnalytics(true);
      
      // Success state
      setIsSubmitted(true);
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      // Reset form after a short delay
      setTimeout(() => {
        (e.target as HTMLFormElement).reset();
        setFormErrors({});
        setTouchedFields({});
        setIsSubmitted(false);
      }, 3000);

    } catch (error: any) {
      console.error('Contact form submission error:', error);
      
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
            setTouchedFields(prev => ({ ...prev, [err.path[0] as string]: true }));
          }
        });
        setFormErrors(newErrors);
        
        toast({
          title: "Form Validation Error",
          description: "Please check the highlighted fields and try again.",
          variant: "destructive",
        });
      } else {
        // Handle other errors
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to send message. Please try again or contact us directly.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <head>
        <title>Contact ZimEventPro - Get in Touch | Event Planning Services</title>
        <meta 
          name="description" 
          content="Contact ZimEventPro for event planning services in Zimbabwe. Get quotes for venues, catering, entertainment and more. Available Monday-Saturday." 
        />
        <meta name="keywords" content="contact zimeventpro, event planning zimbabwe, contact form, event services, harare events" />
        <link rel="canonical" href="https://zimeventpro.co.zw/contact" />
      </head>
      
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Ready to plan your perfect event? We're here to help make it happen.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Get in touch with us for bookings, inquiries, or to list your event services.
                </p>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Office Address</h3>
                        <p className="text-muted-foreground">
                          27 Triscombe Drive<br />
                          Chisipite<br />
                          Harare, Zimbabwe
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Email Us</h3>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">
                            General Inquiries: <a href="mailto:info@zimeventpro.co.zw" className="text-primary hover:underline">info@zimeventpro.co.zw</a>
                          </p>
                          <p className="text-muted-foreground">
                            Bookings: <a href="mailto:bookings@zimeventpro.co.zw" className="text-primary hover:underline">bookings@zimeventpro.co.zw</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Call Us</h3>
                        <p className="text-muted-foreground">263 77 440 9989</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Hours */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Business Hours</h3>
                        <div className="space-y-1 text-muted-foreground">
                          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                          <p>Saturday: 9:00 AM - 4:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Developer Integration Status (only visible in development) */}
                  {process.env.NODE_ENV === 'development' && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-800 text-xs">
                        <strong>Backend Integration Status:</strong> {integrationStatus}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {isSubmitted && (
                    <Alert className="border-green-200 bg-green-50">
                      <Mail className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Your message has been sent successfully! We'll respond within 24 hours.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">First Name *</label>
                        <Input 
                          name="firstName" 
                          placeholder="John" 
                          onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                          className={touchedFields.firstName && formErrors.firstName ? 'border-destructive focus:border-destructive' : ''}
                          required 
                        />
                        {touchedFields.firstName && formErrors.firstName && (
                          <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Last Name *</label>
                        <Input 
                          name="lastName" 
                          placeholder="Doe" 
                          onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                          className={touchedFields.lastName && formErrors.lastName ? 'border-destructive focus:border-destructive' : ''}
                          required 
                        />
                        {touchedFields.lastName && formErrors.lastName && (
                          <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address *</label>
                      <Input 
                        name="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        onBlur={(e) => handleFieldBlur('email', e.target.value)}
                        className={touchedFields.email && formErrors.email ? 'border-destructive focus:border-destructive' : ''}
                        required 
                      />
                      {touchedFields.email && formErrors.email && (
                        <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number (Optional)</label>
                      <Input 
                        name="phone" 
                        placeholder="+263 77 123 4567"
                        onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                        className={touchedFields.phone && formErrors.phone ? 'border-destructive focus:border-destructive' : ''}
                      />
                      {touchedFields.phone && formErrors.phone && (
                        <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Include country code for international numbers
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject *</label>
                      <Input 
                        name="subject" 
                        placeholder="Event planning inquiry"
                        onBlur={(e) => handleFieldBlur('subject', e.target.value)}
                        className={touchedFields.subject && formErrors.subject ? 'border-destructive focus:border-destructive' : ''}
                        required 
                      />
                      {touchedFields.subject && formErrors.subject && (
                        <p className="text-xs text-destructive mt-1">{formErrors.subject}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message *</label>
                      <Textarea 
                        name="message"
                        placeholder="Tell us about your event needs, preferred dates, guest count, and any specific requirements..."
                        className={`min-h-32 resize-none ${touchedFields.message && formErrors.message ? 'border-destructive focus:border-destructive' : ''}`}
                        onBlur={(e) => handleFieldBlur('message', e.target.value)}
                        required
                      />
                      {touchedFields.message && formErrors.message && (
                        <p className="text-xs text-destructive mt-1">{formErrors.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 10 characters, maximum 2000 characters
                      </p>
                    </div>

                    <Alert>
                      <AlertDescription className="text-sm">
                        By submitting this form, you consent to us contacting you about your inquiry. 
                        We respect your privacy and will never share your information with third parties.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || isSubmitted}
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? "Sending Message..." : isSubmitted ? "Message Sent!" : "Send Message"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;