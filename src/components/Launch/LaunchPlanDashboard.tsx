import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock, Users, Zap, DollarSign, Target, Phone } from 'lucide-react';

const LaunchPlanDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('month1');

  const launchPhases = {
    month1: {
      title: "Month 1: Foundation & Pilot",
      progress: 0,
      color: "bg-blue-500",
      milestones: [
        { week: 1, task: "Complete EcoCash API integration", status: "pending", priority: "high" },
        { week: 1, task: "Finalize MVP feature set", status: "pending", priority: "high" },
        { week: 2, task: "Onboard 3 pilot venues (Harare)", status: "pending", priority: "high" },
        { week: 2, task: "Set up customer support infrastructure", status: "pending", priority: "medium" },
        { week: 3, task: "Launch closed beta with 100 users", status: "pending", priority: "high" },
        { week: 3, task: "Implement feedback loop system", status: "pending", priority: "medium" },
        { week: 4, task: "Security audit & fraud testing", status: "pending", priority: "high" },
        { week: 4, task: "Staff training & documentation", status: "pending", priority: "medium" }
      ]
    },
    month2: {
      title: "Month 2: Market Entry & Growth",
      progress: 0,
      color: "bg-green-500",
      milestones: [
        { week: 5, task: "Public launch in Harare market", status: "pending", priority: "high" },
        { week: 5, task: "Launch PR campaign & media blitz", status: "pending", priority: "high" },
        { week: 6, task: "Onboard 15+ venues across Harare", status: "pending", priority: "high" },
        { week: 6, task: "Influencer partnership activation", status: "pending", priority: "medium" },
        { week: 7, task: "Customer acquisition campaigns", status: "pending", priority: "high" },
        { week: 7, task: "Process first 1,000 tickets", status: "pending", priority: "high" },
        { week: 8, task: "Expand to Bulawayo market", status: "pending", priority: "medium" },
        { week: 8, task: "Launch referral program", status: "pending", priority: "low" }
      ]
    },
    month3: {
      title: "Month 3: Scale & Optimize",
      progress: 0,
      color: "bg-purple-500",
      milestones: [
        { week: 9, task: "Process 5,000+ tickets monthly", status: "pending", priority: "high" },
        { week: 9, task: "Launch premium venue features", status: "pending", priority: "medium" },
        { week: 10, task: "Expand to Victoria Falls market", status: "pending", priority: "medium" },
        { week: 10, task: "Implement advanced analytics", status: "pending", priority: "low" },
        { week: 11, task: "Plan Phase 2 (Bus transport)", status: "pending", priority: "medium" },
        { week: 11, task: "Secure Series A funding round", status: "pending", priority: "high" },
        { week: 12, task: "Launch enterprise partnerships", status: "pending", priority: "medium" },
        { week: 12, task: "Establish market leadership", status: "pending", priority: "high" }
      ]
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ZimEventPro Launch Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Strategic 3-month roadmap to establish market leadership in Zimbabwe's digital ticketing space
          </p>
        </div>

        {/* Launch Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Launch Goal</h3>
              <p className="text-2xl font-bold text-blue-600">10,000</p>
              <p className="text-sm text-gray-600">Tickets Sold (Month 3)</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Venue Target</h3>
              <p className="text-2xl font-bold text-green-600">50+</p>
              <p className="text-sm text-gray-600">Partner Venues</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Revenue Target</h3>
              <p className="text-2xl font-bold text-purple-600">$25K</p>
              <p className="text-sm text-gray-600">Monthly by Month 3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Market Position</h3>
              <p className="text-2xl font-bold text-yellow-600">#1</p>
              <p className="text-sm text-gray-600">Digital Ticketing in Zim</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Launch Timeline */}
        <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month1" className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Month 1: Foundation
            </TabsTrigger>
            <TabsTrigger value="month2" className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Month 2: Launch
            </TabsTrigger>
            <TabsTrigger value="month3" className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Month 3: Scale
            </TabsTrigger>
          </TabsList>

          {Object.entries(launchPhases).map(([key, phase]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{phase.title}</CardTitle>
                    <div className="flex items-center gap-4">
                      <Progress value={phase.progress} className="w-32" />
                      <span className="text-sm text-gray-600">{phase.progress}% Complete</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {phase.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(milestone.status)}
                          <div>
                            <p className="font-medium text-gray-900">{milestone.task}</p>
                            <p className="text-sm text-gray-600">Week {milestone.week}</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(milestone.priority)}>
                          {milestone.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Key Success Metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              Key Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">1,000+</p>
                <p className="text-sm text-gray-600">Month 1 Beta Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">15+</p>
                <p className="text-sm text-gray-600">Partner Venues Month 2</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">95%+</p>
                <p className="text-sm text-gray-600">Payment Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">4.5+</p>
                <p className="text-sm text-gray-600">Customer Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchPlanDashboard;