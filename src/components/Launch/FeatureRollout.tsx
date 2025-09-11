import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Zap, Shield, Smartphone, CreditCard } from 'lucide-react';

const FeatureRollout = () => {
  const features = [
    {
      category: "Core MVP Features",
      items: [
        {
          name: "Event Listings & Search",
          description: "Browse and search events with filters",
          priority: "Critical",
          timeline: "Week 1-2",
          status: "in-development",
          complexity: "Medium",
          dependencies: ["Database schema", "Search indexing"]
        },
        {
          name: "Seat Selection System", 
          description: "Interactive seat map with 3 pricing tiers",
          priority: "Critical",
          timeline: "Week 2-3",
          status: "pending",
          complexity: "High",
          dependencies: ["Venue mapping", "Real-time updates"]
        },
        {
          name: "EcoCash Payment Integration",
          description: "Secure mobile money payments",
          priority: "Critical", 
          timeline: "Week 1-2",
          status: "in-development",
          complexity: "High",
          dependencies: ["EcoCash API access", "Security audit"]
        },
        {
          name: "QR Code Ticket Generation",
          description: "Fraud-resistant digital tickets",
          priority: "Critical",
          timeline: "Week 3-4",
          status: "pending",
          complexity: "Medium",
          dependencies: ["Cryptographic signing", "QR libraries"]
        }
      ]
    },
    {
      category: "User Experience Features",
      items: [
        {
          name: "WhatsApp Ticket Delivery",
          description: "Instant ticket delivery via WhatsApp",
          priority: "High",
          timeline: "Week 4-5",
          status: "pending",
          complexity: "Medium",
          dependencies: ["WhatsApp Business API", "Message templates"]
        },
        {
          name: "Offline QR Validation",
          description: "Venue staff can validate tickets offline",
          priority: "High",
          timeline: "Week 5-6",
          status: "pending",
          complexity: "High",
          dependencies: ["PWA functionality", "Local storage"]
        },
        {
          name: "SMS Backup Delivery",
          description: "Fallback ticket delivery via SMS",
          priority: "Medium",
          timeline: "Week 6-7",
          status: "pending",
          complexity: "Low",
          dependencies: ["SMS gateway", "Message formatting"]
        }
      ]
    },
    {
      category: "Business Features",
      items: [
        {
          name: "Venue Dashboard",
          description: "Event management and analytics for venues",
          priority: "High",
          timeline: "Week 7-8",
          status: "pending",
          complexity: "High",
          dependencies: ["Role-based access", "Analytics system"]
        },
        {
          name: "OneMoney Integration",
          description: "Second mobile money option",
          priority: "Medium",
          timeline: "Week 8-9",
          status: "pending",
          complexity: "Medium",
          dependencies: ["OneMoney API", "Payment routing"]
        },
        {
          name: "Basic Fraud Detection",
          description: "Duplicate scan prevention and monitoring",
          priority: "High",
          timeline: "Week 9-10",
          status: "pending", 
          complexity: "High",
          dependencies: ["Analytics pipeline", "Alert system"]
        }
      ]
    },
    {
      category: "Growth Features",
      items: [
        {
          name: "Referral System",
          description: "Customer referral rewards program",
          priority: "Low",
          timeline: "Week 10-11",
          status: "pending",
          complexity: "Medium",
          dependencies: ["User accounts", "Reward tracking"]
        },
        {
          name: "Group Booking Discounts",
          description: "Bulk ticket purchases with discounts",
          priority: "Medium",
          timeline: "Week 11-12",
          status: "pending",
          complexity: "Medium",
          dependencies: ["Pricing engine", "Group management"]
        },
        {
          name: "Event Recommendations",
          description: "AI-powered event suggestions",
          priority: "Low",
          timeline: "Month 3+",
          status: "future",
          complexity: "High",
          dependencies: ["User behavior data", "ML models"]
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in-development': return 'text-blue-500';
      case 'pending': return 'text-yellow-500';
      case 'future': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-development': return <Zap className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'future': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return 'bg-red-50 text-red-700';
      case 'Medium': return 'bg-yellow-50 text-yellow-700';
      case 'Low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Feature Rollout Timeline</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Strategic feature development prioritized for rapid market entry and user adoption
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Smartphone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Mobile First</h3>
            <p className="text-sm text-gray-600">90% mobile usage expected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">EcoCash Ready</h3>
            <p className="text-sm text-gray-600">70% market penetration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Fraud Protection</h3>
            <p className="text-sm text-gray-600">Bank-grade security</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold">Instant Delivery</h3>
            <p className="text-sm text-gray-600">28-second checkout</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Categories */}
      {features.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle className="text-xl">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.items.map((feature, featureIndex) => (
                <div key={featureIndex} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={getStatusColor(feature.status)}>
                          {getStatusIcon(feature.status)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Timeline</p>
                      <p className="text-sm text-gray-600">{feature.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Complexity</p>
                      <Badge className={getComplexityColor(feature.complexity)}>
                        {feature.complexity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={getStatusColor(feature.status)}>
                          {getStatusIcon(feature.status)}
                        </div>
                        <span className="text-sm capitalize">{feature.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {feature.dependencies.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Dependencies</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.dependencies.map((dep, depIndex) => (
                          <Badge key={depIndex} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Development Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>12-Week Development Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-sm">
              <div className="font-medium">Week</div>
              {Array.from({length: 12}, (_, i) => (
                <div key={i} className="text-center font-medium">{i + 1}</div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="text-sm font-medium">Core MVP</div>
                <div className="col-span-4 bg-red-200 h-6 rounded"></div>
                <div className="col-span-8"></div>
              </div>
              
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="text-sm font-medium">User Experience</div>
                <div className="col-span-2"></div>
                <div className="col-span-4 bg-blue-200 h-6 rounded"></div>
                <div className="col-span-6"></div>
              </div>
              
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="text-sm font-medium">Business Features</div>
                <div className="col-span-6"></div>
                <div className="col-span-4 bg-green-200 h-6 rounded"></div>
                <div className="col-span-2"></div>
              </div>
              
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="text-sm font-medium">Growth Features</div>
                <div className="col-span-9"></div>
                <div className="col-span-3 bg-purple-200 h-6 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureRollout;