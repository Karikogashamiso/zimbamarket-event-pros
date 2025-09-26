import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Search,
  BookOpen,
  Users,
  Settings,
  Star,
  ArrowRight
} from "lucide-react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const faqCategories = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "booking", label: "Booking", icon: CheckCircle },
    { id: "payment", label: "Payments", icon: Settings },
    { id: "vendors", label: "For Vendors", icon: Users },
    { id: "general", label: "General", icon: HelpCircle }
  ];

  const faqs = [
    {
      category: "booking",
      question: "How do I book a service on ZimEventPro?",
      answer: "Browse our services, select your preferred vendor, check availability, and click 'Book Now'. You'll receive instant confirmation via email and SMS."
    },
    {
      category: "payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, mobile money (EcoCash, OneMoney), bank transfers, and cash payments for selected services."
    },
    {
      category: "booking",
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify bookings up to 48 hours before the event date. Cancellation terms vary by vendor and are clearly stated in your booking confirmation."
    },
    {
      category: "vendors",
      question: "How do I list my business on ZimEventPro?",
      answer: "Click 'List Your Business', fill out the application form, and our team will review and approve your listing within 24 hours. Basic listings are free!"
    },
    {
      category: "general",
      question: "Are all vendors verified?",
      answer: "Yes! Every vendor on our platform is thoroughly vetted, background-checked, and verified. We also collect reviews from real customers to ensure quality."
    },
    {
      category: "payment",
      question: "When do I pay for services?",
      answer: "Payment terms vary by vendor. Some require deposits upon booking, while others accept payment on the day of service. All payment terms are clearly stated before booking."
    },
    {
      category: "general",
      question: "Do you cover events outside Harare?",
      answer: "Absolutely! We have verified vendors across Zimbabwe including Bulawayo, Mutare, Victoria Falls, Gweru, and many other locations."
    },
    {
      category: "vendors",
      question: "What are the fees for vendors?",
      answer: "Basic listings are free. Premium features start from $20/month. We only charge a small commission on successful bookings - you only pay when you earn!"
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our support team",
      details: "+263 4 123 4567",
      hours: "Mon-Fri: 8AM-6PM",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      details: "support@zimeventpro.co.zw",
      hours: "Response within 4 hours",
      action: "Send Email"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our team instantly",
      details: "Available on website",
      hours: "Mon-Fri: 8AM-8PM",
      action: "Start Chat"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Spacer */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How can we <span className="text-primary">help</span> you?
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find answers to common questions, get support, or contact our team directly.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search for help articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    // This filters help articles locally
                    console.log('Help search:', searchQuery);
                  }
                }}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover-scale transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{method.title}</h3>
                  <p className="text-muted-foreground mb-4">{method.description}</p>
                  <div className="space-y-2 mb-6">
                    <p className="font-semibold text-primary">{method.details}</p>
                    <p className="text-sm text-muted-foreground">{method.hours}</p>
                  </div>
                  <Button className="w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Quick answers to common questions about ZimEventPro
              </p>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </Button>
              ))}
            </div>
            
            {/* FAQ Items */}
            <div className="space-y-6">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        <Badge variant="outline" className="mt-3 capitalize">
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No FAQs found matching your search. Try adjusting your search terms or contact us directly.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-xl text-muted-foreground">
                Can't find what you're looking for? Send us a message and we'll get back to you within 4 hours.
              </p>
            </div>
            
            <Card className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input placeholder="What do you need help with?" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea 
                    placeholder="Please describe your question or issue in detail..."
                    className="min-h-32"
                  />
                </div>
                
                <Button size="lg" className="w-full text-lg py-3 h-auto">
                  <Mail className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;