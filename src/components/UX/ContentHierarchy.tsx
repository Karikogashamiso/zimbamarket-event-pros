import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  Users,
  Zap,
  Shield,
  Clock
} from "lucide-react";

interface ContentSection {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  content: React.ReactNode;
  cta?: {
    text: string;
    href: string;
    variant?: "default" | "outline" | "secondary";
  };
}

const ContentHierarchy = () => {
  const [openSections, setOpenSections] = useState<string[]>(["hero-features"]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Bite-sized content sections with progressive disclosure
  const contentSections: ContentSection[] = [
    {
      id: "hero-features",
      title: "Why Choose ZimEventPro?",
      description: "The smartest way to book events in Zimbabwe",
      priority: "high",
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center hover-lift">
            <Zap className="w-8 h-8 mx-auto text-primary mb-3" />
            <h4 className="font-semibold mb-2">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">Book in under 60 seconds</p>
          </Card>
          <Card className="p-4 text-center hover-lift">
            <Shield className="w-8 h-8 mx-auto text-primary mb-3" />
            <h4 className="font-semibold mb-2">100% Secure</h4>
            <p className="text-sm text-muted-foreground">Bank-grade security</p>
          </Card>
          <Card className="p-4 text-center hover-lift">
            <Clock className="w-8 h-8 mx-auto text-primary mb-3" />
            <h4 className="font-semibold mb-2">24/7 Support</h4>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </Card>
        </div>
      ),
      cta: { text: "Start Booking Now", href: "/categories" }
    },
    {
      id: "popular-services",
      title: "Most Popular Services",
      description: "Trending bookings this week",
      priority: "high",
      content: (
        <Tabs defaultValue="venues" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="catering">Catering</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="photography">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="venues" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Royal Gardens</h4>
                      <p className="text-sm text-muted-foreground">Luxury Wedding Venue</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">4.9 (127 reviews)</span>
                      </div>
                    </div>
                    <Badge variant="secondary">From $500</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="catering" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading catering options...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="music" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading music services...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="photography" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading photography services...</p>
            </div>
          </TabsContent>
        </Tabs>
      ),
      cta: { text: "View All Services", href: "/categories", variant: "outline" }
    },
    {
      id: "how-it-works",
      title: "How It Works",
      description: "Simple 3-step process",
      priority: "medium",
      content: (
        <div className="space-y-6">
          {[
            { step: 1, title: "Search & Compare", desc: "Browse hundreds of verified providers" },
            { step: 2, title: "Book Instantly", desc: "Secure your date with instant confirmation" },
            { step: 3, title: "Enjoy Your Event", desc: "We handle the details, you enjoy the celebration" }
          ].map((item) => (
            <div key={item.step} className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
      cta: { text: "Get Started", href: "/categories", variant: "secondary" }
    },
    {
      id: "stats",
      title: "Trusted by Thousands",
      description: "Join Zimbabwe's largest event community",
      priority: "medium",
      content: (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">1,200+</div>
            <div className="text-sm text-muted-foreground">Vendors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      )
    }
  ];

  // Sort sections by priority
  const sortedSections = contentSections.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      {/* Above the fold - High priority content */}
      <div className="space-y-4">
        {sortedSections
          .filter(section => section.priority === "high")
          .map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">{section.description}</p>
                  </div>
                  <Badge variant={section.priority === "high" ? "default" : "outline"}>
                    {section.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {section.content}
                {section.cta && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      asChild 
                      variant={section.cta.variant || "default"}
                      className="group"
                    >
                      <a href={section.cta.href}>
                        {section.cta.text}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Progressive disclosure for medium/low priority content */}
      <div className="space-y-2">
        {sortedSections
          .filter(section => section.priority !== "high")
          .map((section) => (
            <Collapsible
              key={section.id}
              open={openSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {section.title}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {section.priority}
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{section.description}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${
                        openSections.includes(section.id) ? "rotate-180" : ""
                      }`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.content}
                    {section.cta && (
                      <div className="mt-6 flex justify-center">
                        <Button 
                          asChild 
                          variant={section.cta.variant || "default"}
                          size="sm"
                          className="group"
                        >
                          <a href={section.cta.href}>
                            {section.cta.text}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
      </div>
      
      {/* Quick summary for closed sections */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-3">
          Expand sections above to learn more • 
          <span className="ml-1 font-medium">
            {openSections.length}/{contentSections.length} sections open
          </span>
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setOpenSections(
            openSections.length === contentSections.length 
              ? ["hero-features"] 
              : contentSections.map(s => s.id)
          )}
        >
          {openSections.length === contentSections.length ? "Collapse All" : "Expand All"}
        </Button>
      </div>
    </div>
  );
};

export default ContentHierarchy;