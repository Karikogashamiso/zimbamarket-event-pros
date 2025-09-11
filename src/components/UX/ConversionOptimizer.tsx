import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  MousePointer,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  Star,
  Phone,
  MessageSquare
} from "lucide-react";

interface CTAPlacement {
  id: string;
  location: string;
  text: string;
  type: "primary" | "secondary" | "ghost";
  performance: number;
  conversions: number;
  position: "above-fold" | "mid-page" | "footer";
}

const ConversionOptimizer = () => {
  const [selectedCTA, setSelectedCTA] = useState<string | null>(null);
  const [heatmapActive, setHeatmapActive] = useState(false);

  // Sample CTA performance data
  const ctaPlacements: CTAPlacement[] = [
    {
      id: "hero-primary",
      location: "Hero Section",
      text: "Book Your Event Now",
      type: "primary",
      performance: 8.5,
      conversions: 342,
      position: "above-fold"
    },
    {
      id: "services-grid",
      location: "Services Grid",
      text: "View Details",
      type: "secondary",
      performance: 6.2,
      conversions: 156,
      position: "mid-page"
    },
    {
      id: "testimonials",
      location: "After Testimonials",
      text: "Join 50,000+ Happy Customers",
      type: "primary",
      performance: 9.1,
      conversions: 289,
      position: "mid-page"
    },
    {
      id: "footer-sticky",
      location: "Sticky Footer",
      text: "Get Started Free",
      type: "primary",
      performance: 7.3,
      conversions: 198,
      position: "footer"
    }
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Conversion Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-primary">4.7%</p>
            </div>
            <Target className="w-8 h-8 text-primary" />
          </div>
          <div className="mt-2">
            <Progress value={47} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">+0.8% from last month</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-primary">1,247</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div className="mt-2">
            <Progress value={73} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">+12% this week</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Session</p>
              <p className="text-2xl font-bold text-primary">3m 42s</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div className="mt-2">
            <Progress value={62} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Ideal: 2-4 minutes</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Return Visitors</p>
              <p className="text-2xl font-bold text-primary">34%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div className="mt-2">
            <Progress value={34} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Building loyalty</p>
          </div>
        </Card>
      </div>

      {/* CTA Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MousePointer className="w-5 h-5 mr-2" />
            CTA Performance Analysis
          </CardTitle>
          <p className="text-muted-foreground">Strategic placement analysis for maximum conversions</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ctaPlacements.map((cta) => (
              <div
                key={cta.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedCTA === cta.id 
                    ? "border-primary bg-primary/5" 
                    : "hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => setSelectedCTA(cta.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold">{cta.location}</h4>
                      {getPerformanceBadge(cta.performance)}
                      <Badge variant="outline" className="text-xs">
                        {cta.position}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">"{cta.text}"</p>
                    
                    <div className="flex items-center space-x-6 mt-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Score: </span>
                        <span className={`font-bold ${getPerformanceColor(cta.performance)}`}>
                          {cta.performance}/10
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Conversions: </span>
                        <span className="font-bold">{cta.conversions}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant={cta.type === "primary" ? "default" : cta.type === "secondary" ? "secondary" : "ghost"} 
                    className="ml-4"
                    size="sm"
                  >
                    {cta.text}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Journey Optimization */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              User Journey Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, action: "Land on Homepage", rate: "100%", users: "10,000" },
                { step: 2, action: "Browse Services", rate: "68%", users: "6,800" },
                { step: 3, action: "View Details", rate: "45%", users: "4,500" },
                { step: 4, action: "Start Booking", rate: "12%", users: "1,200" },
                { step: 5, action: "Complete Purchase", rate: "8.5%", users: "850" }
              ].map((stage) => (
                <div key={stage.step} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {stage.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{stage.action}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{stage.rate}</div>
                        <div className="text-xs text-muted-foreground">{stage.users} users</div>
                      </div>
                    </div>
                    <Progress 
                      value={parseFloat(stage.rate)} 
                      className="mt-2 h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Add Social Proof Above Fold",
                  impact: "High",
                  effort: "Low",
                  description: "Display customer count & ratings in hero section",
                  icon: Star
                },
                {
                  title: "Implement Exit-Intent Popup",
                  impact: "Medium",
                  effort: "Low",
                  description: "Capture abandoning visitors with special offer",
                  icon: Target
                },
                {
                  title: "Add Live Chat Widget",
                  impact: "High",
                  effort: "Medium",
                  description: "Reduce booking hesitation with instant support",
                  icon: MessageSquare
                },
                {
                  title: "Mobile Checkout Optimization",
                  impact: "High",
                  effort: "High",
                  description: "Streamline mobile booking flow",
                  icon: Phone
                }
              ].map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <rec.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <div className="flex space-x-2">
                        <Badge 
                          variant={rec.impact === "High" ? "default" : rec.impact === "Medium" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {rec.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.effort}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Testing Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            A/B Testing Framework
          </CardTitle>
          <p className="text-muted-foreground">Current experiments and results</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Test 1 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Hero Button Text</h4>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">A: "Book Now"</span>
                  <span className="text-sm font-bold">3.2% CVR</span>
                </div>
                <Progress value={32} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">B: "Get Started Free"</span>
                  <span className="text-sm font-bold text-green-600">4.7% CVR</span>
                </div>
                <Progress value={47} className="h-2" />
                
                <div className="text-xs text-muted-foreground">
                  Winner: Variant B (+47% improvement) • 95% confidence
                </div>
              </div>
            </div>

            {/* Test 2 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Pricing Display</h4>
                <Badge variant="secondary">Preparing</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">A: "From $200"</span>
                  <span className="text-sm">--</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">B: "Starting at $200/event"</span>
                  <span className="text-sm">--</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Test starting next week • Target: 1,000 visitors per variant
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline">
              View All Tests & Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              User Interaction Heatmap
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHeatmapActive(!heatmapActive)}
            >
              {heatmapActive ? "Hide" : "Show"} Heatmap
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`relative border rounded-lg overflow-hidden ${heatmapActive ? "bg-gradient-to-b from-red-500/20 via-yellow-500/20 to-green-500/20" : "bg-muted/10"}`}>
            <div className="p-6 space-y-4">
              <div className={`h-20 rounded-lg flex items-center justify-center ${heatmapActive ? "bg-red-500/40" : "bg-muted"}`}>
                <span className="text-sm font-medium">Hero Section {heatmapActive && "🔥🔥🔥"}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`h-16 rounded-lg flex items-center justify-center ${heatmapActive ? "bg-orange-500/30" : "bg-muted"}`}>
                  <span className="text-xs">Service 1 {heatmapActive && "🔥🔥"}</span>
                </div>
                <div className={`h-16 rounded-lg flex items-center justify-center ${heatmapActive ? "bg-yellow-500/30" : "bg-muted"}`}>
                  <span className="text-xs">Service 2 {heatmapActive && "🔥"}</span>
                </div>
                <div className={`h-16 rounded-lg flex items-center justify-center ${heatmapActive ? "bg-green-500/30" : "bg-muted"}`}>
                  <span className="text-xs">Service 3</span>
                </div>
              </div>
              <div className={`h-12 rounded-lg flex items-center justify-center ${heatmapActive ? "bg-red-500/50" : "bg-muted"}`}>
                <span className="text-sm">CTA Button {heatmapActive && "🔥🔥🔥🔥"}</span>
              </div>
            </div>
          </div>
          {heatmapActive && (
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500/30 rounded mr-2"></div>
                <span>Low Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500/30 rounded mr-2"></div>
                <span>Medium Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500/30 rounded mr-2"></div>
                <span>High Activity</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionOptimizer;