import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Users, 
  Globe,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Scale,
  Heart,
  Lock
} from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Info,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, list your business, book services, or contact us. This may include your name, email address, phone number, business information, and payment details."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our platform, including your IP address, browser type, operating system, referring URLs, access times, and pages viewed."
        },
        {
          subtitle: "Location Information",
          text: "We may collect location information to help you find relevant services and venues in your area, with your consent where required by law."
        }
      ]
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: Users,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services."
        },
        {
          subtitle: "Personalization",
          text: "We use your information to personalize your experience, show you relevant content, and provide customized recommendations for events and services."
        },
        {
          subtitle: "Marketing Communications",
          text: "With your consent, we may send you promotional emails about new features, services, or events that may interest you. You can opt out at any time."
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Globe,
      content: [
        {
          subtitle: "Service Providers",
          text: "We may share your information with trusted third-party service providers who help us operate our platform, process payments, or provide customer support."
        },
        {
          subtitle: "Business Partners",
          text: "When you book a service, we share relevant information with the vendor to facilitate the service provision and communication."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect our rights, privacy, safety, or property."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Shield,
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Data Encryption",
          text: "We use industry-standard encryption to protect sensitive information during transmission and storage, including payment information and personal details."
        },
        {
          subtitle: "Access Controls",
          text: "We limit access to your personal information to employees and contractors who need it to perform their job functions and are bound by confidentiality obligations."
        }
      ]
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: CheckCircle,
      content: [
        {
          subtitle: "Account Information",
          text: "You can update, correct, or delete your account information at any time by logging into your account or contacting us directly."
        },
        {
          subtitle: "Data Portability",
          text: "You have the right to request a copy of the personal information we hold about you in a machine-readable format."
        },
        {
          subtitle: "Marketing Opt-out",
          text: "You can opt out of receiving promotional emails by following the unsubscribe instructions in any marketing email or by contacting us directly."
        }
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Lock,
      content: [
        {
          subtitle: "Retention Period",
          text: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law."
        },
        {
          subtitle: "Account Deletion",
          text: "When you delete your account, we will delete your personal information, except where we need to retain it for legal, accounting, or security purposes."
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Privacy & Security</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how ZimEventPro collects, uses, and protects your personal information.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>Last updated: January 2024</span>
              <Badge variant="outline" className="text-primary border-primary">
                GDPR Compliant
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
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Commitment to Your Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    ZimEventPro ("we," "our," or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By using ZimEventPro, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
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
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Questions About This Policy?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                If you have any questions about this Privacy Policy, our data practices, or your rights, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <a href="/contact" className="flex items-center">
                    Contact Us
                  </a>
                </Button>
                <Button variant="outline" size="lg">
                  <a href="mailto:privacy@zimeventpro.co.zw" className="flex items-center">
                    Email Privacy Team
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
                <h4 className="font-semibold mb-2">Changes to This Policy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;