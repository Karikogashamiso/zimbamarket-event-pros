import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Smartphone, 
  Target, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Download,
  Eye,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

// Import our optimization components
import OptimizedNavigation from "@/components/UX/OptimizedNavigation";
import ContentHierarchy from "@/components/UX/ContentHierarchy";
import PerformanceOptimizer from "@/components/UX/PerformanceOptimizer";
import MobileFirstDesign from "@/components/UX/MobileFirstDesign";
import ConversionOptimizer from "@/components/UX/ConversionOptimizer";

const UXOptimizationGuide = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const optimizationAreas = [
    {
      id: "navigation",
      title: "Navigation & Structure",
      description: "Streamlined navigation with progressive disclosure",
      priority: "High",
      impact: "85%",
      status: "In Progress",
      component: <OptimizedNavigation />
    },
    {
      id: "content",
      title: "Content Hierarchy",
      description: "Bite-sized, scannable content with smart organization", 
      priority: "High",
      impact: "78%",
      status: "Ready",
      component: <ContentHierarchy />
    },
    {
      id: "performance",
      title: "Performance Optimization",
      description: "Core Web Vitals, lazy loading, and speed optimization",
      priority: "Critical",
      impact: "92%",
      status: "Active",
      component: <PerformanceOptimizer />
    },
    {
      id: "mobile",
      title: "Mobile-First Design",
      description: "Optimized mobile experience for 68% of users",
      priority: "High", 
      impact: "74%",
      status: "Ready",
      component: <MobileFirstDesign />
    },
    {
      id: "conversion",
      title: "Conversion Optimization",
      description: "Strategic CTA placement and A/B testing framework",
      priority: "Medium",
      impact: "65%",
      status: "Planning",
      component: <ConversionOptimizer />
    }
  ];

  const actionPlan = [
    {
      phase: "Week 1: Foundation",
      actions: [
        { id: "implement-navigation", task: "Deploy optimized navigation system", estimate: "2 days" },
        { id: "content-audit", task: "Audit and reorganize content hierarchy", estimate: "3 days" },
        { id: "mobile-testing", task: "Test mobile experience across devices", estimate: "1 day" }
      ]
    },
    {
      phase: "Week 2: Performance",  
      actions: [
        { id: "image-optimization", task: "Implement advanced image optimization", estimate: "2 days" },
        { id: "lazy-loading", task: "Add progressive loading for all sections", estimate: "1 day" },
        { id: "caching-strategy", task: "Deploy CDN and caching improvements", estimate: "2 days" }
      ]
    },
    {
      phase: "Week 3: Conversion",
      actions: [
        { id: "cta-optimization", task: "Optimize CTA placement and copy", estimate: "2 days" },
        { id: "ab-testing", task: "Set up A/B testing framework", estimate: "2 days" },
        { id: "analytics-setup", task: "Enhanced conversion tracking", estimate: "1 day" }
      ]
    }
  ];

  const toggleAction = (actionId: string) => {
    setCompletedActions(prev => 
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Ready": "default",
      "In Progress": "secondary", 
      "Active": "default",
      "Planning": "outline"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "Critical") return "text-red-600";
    if (priority === "High") return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">
              UX Optimization Guide
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Comprehensive analysis and actionable improvements for ZimEventPro
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">4.7%</div>
                <div className="text-sm opacity-75">Current CVR</div>
              </div>
              <div>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-sm opacity-75">Mobile Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3:42</div>
                <div className="text-sm opacity-75">Avg Session</div>
              </div>
              <div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm opacity-75">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
            <TabsTrigger value="implementation" className="text-xs">Implementation</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Current State Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">✅ Strengths</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Excellent lazy loading implementation</li>
                      <li>• Strong SEO foundation with structured data</li>
                      <li>• PWA features for offline functionality</li>
                      <li>• Performance monitoring already in place</li>
                      <li>• Good mobile responsive design</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">❌ Areas for Improvement</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Homepage with 10+ sections creates scroll fatigue</li>
                      <li>• Navigation lacks clear user journey paths</li>
                      <li>• CTAs compete for attention without hierarchy</li>
                      <li>• Mobile-first optimization needs enhancement</li>
                      <li>• Content density overwhelms users</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {optimizationAreas.map((area) => (
                <Card key={area.id} className="hover-lift cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getPriorityColor(area.priority)}>
                        {area.priority}
                      </Badge>
                      {getStatusBadge(area.status)}
                    </div>
                    <h3 className="font-semibold mb-2">{area.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{area.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Impact: {area.impact}</span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {optimizationAreas.map((area) => (
              <Card key={area.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span>{area.title}</span>
                      <Badge className={`ml-2 ${getPriorityColor(area.priority)}`}>
                        {area.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline">Impact: {area.impact}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {area.component}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Implementation Tab */}
          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  3-Week Implementation Plan
                </CardTitle>
                <p className="text-muted-foreground">
                  Step-by-step optimization roadmap with estimated timelines
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {actionPlan.map((phase, phaseIndex) => (
                    <div key={phaseIndex}>
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm mr-3">
                          {phaseIndex + 1}
                        </span>
                        {phase.phase}
                      </h3>
                      
                      <div className="space-y-2">
                        {phase.actions.map((action) => (
                          <div 
                            key={action.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleAction(action.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  completedActions.includes(action.id)
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground hover:border-primary"
                                }`}
                              >
                                {completedActions.includes(action.id) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </button>
                              <div>
                                <span className={`font-medium ${
                                  completedActions.includes(action.id) 
                                    ? "line-through text-muted-foreground" 
                                    : ""
                                }`}>
                                  {action.task}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {action.estimate}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Progress Summary</h4>
                  <div className="flex items-center space-x-4">
                    <Progress 
                      value={(completedActions.length / 9) * 100} 
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {completedActions.length}/9 completed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview: Mobile-First Design
                </CardTitle>
                <p className="text-muted-foreground">
                  Interactive preview of optimized mobile experience
                </p>
              </CardHeader>
              <CardContent className="flex justify-center">
                <MobileFirstDesign />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <ConversionOptimizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UXOptimizationGuide;