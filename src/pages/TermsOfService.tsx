import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  FileText, 
  Users, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Gavel,
  Heart,
  Building2
} from "lucide-react";

const TermsOfService = () => {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using ZimEventPro, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or prominent notices on our website."
        }
      ]
    },
    {
      id: "use-of-service",
      title: "Use of Service",
      icon: Users,
      content: [
        {
          subtitle: "Eligibility",
          text: "You must be at least 18 years old to use ZimEventPro. By using our service, you represent and warrant that you meet this age requirement."
        },
        {
          subtitle: "Account Responsibility",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        },
        {
          subtitle: "Prohibited Uses",
          text: "You may not use our service for any illegal or unauthorized purpose, spam, harassment, or any activity that could damage or interfere with our service."
        }
      ]
    },
    {
      id: "vendor-terms",
      title: "Vendor Terms",
      icon: Building2,
      content: [
        {
          subtitle: "Business Listings",
          text: "Vendors are responsible for the accuracy of their business information, pricing, availability, and service descriptions. False or misleading information may result in account suspension."
        },
        {
          subtitle: "Service Delivery",
          text: "Vendors must fulfill all confirmed bookings according to the agreed terms. Failure to deliver services as promised may result in penalties or removal from the platform."
        },
        {
          subtitle: "Commission and Fees",
          text: "ZimEventPro charges a commission on successful bookings. Fee structure and payment terms are outlined in the vendor agreement and billing section."
        }
      ]
    },
    {
      id: "customer-terms",
      title: "Customer Terms",
      icon: Heart,
      content: [
        {
          subtitle: "Booking Obligations",
          text: "Customers are obligated to honor confirmed bookings and pay agreed amounts. Cancellation policies vary by vendor and are clearly stated before booking."
        },
        {
          subtitle: "Payment Terms",
          text: "Payment is due according to the terms specified by each vendor. Late payments may incur additional fees or result in service cancellation."
        },
        {
          subtitle: "Reviews and Ratings",
          text: "Customer reviews must be honest, factual, and based on actual experiences. Fake reviews or defamatory content will be removed."
        }
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: Shield,
      content: [
        {
          subtitle: "Platform Content",
          text: "The ZimEventPro platform, including its design, logos, and content, is protected by copyright and trademark laws. Users may not reproduce or distribute our content without permission."
        },
        {
          subtitle: "User Content",
          text: "By uploading content to our platform, you grant ZimEventPro a license to use, display, and distribute your content for platform operations and marketing purposes."
        },
        {
          subtitle: "Copyright Claims",
          text: "We respond to valid copyright claims in accordance with applicable law. If you believe your copyright has been infringed, please contact us with details."
        }
      ]
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: Scale,
      content: [
        {
          subtitle: "Service Disclaimer",
          text: "ZimEventPro acts as a marketplace connecting customers with vendors. We are not responsible for the quality, safety, or legality of services provided by vendors."
        },
        {
          subtitle: "Damages Limitation",
          text: "Our liability for any damages arising from the use of our service is limited to the amount paid by you for the specific service in question."
        },
        {
          subtitle: "Force Majeure",
          text: "ZimEventPro is not liable for delays or failures in performance resulting from acts beyond our reasonable control, including natural disasters, government actions, or technical failures."
        }
      ]
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      icon: Gavel,
      content: [
        {
          subtitle: "Mediation Process",
          text: "In case of disputes between customers and vendors, ZimEventPro offers mediation services to help resolve issues fairly and efficiently."
        },
        {
          subtitle: "Governing Law",
          text: "These terms are governed by the laws of Zimbabwe. Any legal proceedings must be conducted in the appropriate courts of Zimbabwe."
        },
        {
          subtitle: "Arbitration",
          text: "For significant disputes that cannot be resolved through mediation, binding arbitration may be required as specified in individual service agreements."
        }
      ]
    },
    {
      id: "termination",
      title: "Termination",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Account Termination",
          text: "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, harmful, or illegal activities."
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, your right to use the service ceases immediately. Confirmed bookings may still be honored according to their individual terms."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Legal Terms</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              These terms govern your use of ZimEventPro and outline the rights and responsibilities of all users.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>Last updated: January 2024</span>
              <Badge variant="outline" className="text-primary border-primary">
                Legally Binding
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Overview */}
          <Card className="mb-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Welcome to ZimEventPro</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    These Terms of Service ("Terms") apply to your access and use of ZimEventPro (the "Service") operated by ZimEventPro ("we," "us," or "our"). Please read these Terms carefully before using our Service.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms constitute a legally binding agreement between you and ZimEventPro. By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <section.icon className="w-4 h-4 mr-2" />
                    <span className="text-left">{section.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section) => (
              <Card key={section.id} id={section.id} className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {section.content.map((item, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-lg mb-3 text-primary">
                          {item.subtitle}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-12 p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-0 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                If you have any questions about these Terms of Service, our practices, or your rights and obligations, please contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <a href="/contact" className="flex items-center">
                    Contact Legal Team
                  </a>
                </Button>
                <Button variant="outline" size="lg">
                  <a href="mailto:legal@zimeventpro.co.zw" className="flex items-center">
                    Email Legal Department
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Changes to Terms</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;