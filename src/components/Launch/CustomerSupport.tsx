import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Phone, MessageCircle, Mail, Clock, Users, Headphones, Shield, Zap } from 'lucide-react';

const CustomerSupport = () => {
  const supportChannels = [
    {
      channel: "WhatsApp Support",
      icon: <MessageCircle className="w-6 h-6" />,
      hours: "24/7 Automated + 8AM-8PM Live",
      responseTime: "< 5 minutes",
      languages: ["English", "Shona", "Ndebele"],
      capacity: "Unlimited automated, 500 live/day",
      costPerContact: "$0.10",
      description: "Primary support channel - instant responses for common issues"
    },
    {
      channel: "Phone Support",
      icon: <Phone className="w-6 h-6" />,
      hours: "8AM-6PM Mon-Sat",
      responseTime: "< 30 seconds",
      languages: ["English", "Shona", "Ndebele"],
      capacity: "200 calls/day",
      costPerContact: "$2.50",
      description: "Voice support for complex issues and urgent matters"
    },
    {
      channel: "Email Support",
      icon: <Mail className="w-6 h-6" />,
      hours: "24/7 Processing",
      responseTime: "< 2 hours",
      languages: ["English"],
      capacity: "1000 emails/day",  
      costPerContact: "$1.00",
      description: "Detailed support for account issues and documentation"
    },
    {
      channel: "In-App Chat",
      icon: <Headphones className="w-6 h-6" />,
      hours: "24/7 Bot + 8AM-8PM Live",
      responseTime: "< 2 minutes",
      languages: ["English", "Shona"],
      capacity: "Unlimited bot, 300 live/day",
      costPerContact: "$0.75",
      description: "Contextual help within the app experience"
    }
  ];

  const supportTeamStructure = [
    {
      role: "Support Manager",
      count: 1,
      responsibilities: ["Team leadership", "Escalation handling", "Quality assurance", "Reporting"],
      salary: "$1,200/month",
      skills: ["Management", "Customer service", "Problem solving", "Analytics"]
    },
    {
      role: "Senior Support Agents",
      count: 2,
      responsibilities: ["Complex issue resolution", "Training junior staff", "Process improvement", "Customer escalations"],
      salary: "$800/month each",
      skills: ["Advanced product knowledge", "Problem solving", "Mentoring", "Multi-language"]
    },
    {
      role: "Support Agents",
      count: 4,
      responsibilities: ["General inquiries", "Ticket booking help", "Payment issues", "Account management"],
      salary: "$600/month each",
      skills: ["Customer service", "Product knowledge", "Local languages", "Patience"]
    },
    {
      role: "Technical Support",
      count: 1,
      responsibilities: ["App issues", "Integration problems", "Bug triage", "Developer liaison"],
      salary: "$1,000/month",
      skills: ["Technical knowledge", "Debugging", "Communication", "Problem analysis"]
    }
  ];

  const knowledgeBase = [
    {
      category: "Getting Started",
      articles: [
        "How to create an account",
        "Downloading and installing the app",
        "Finding events in your area",
        "Understanding ticket types and pricing"
      ]
    },
    {
      category: "Booking & Payments",
      articles: [
        "How to book tickets step-by-step",
        "EcoCash payment guide",
        "OneMoney payment guide",
        "Understanding booking fees",
        "Group booking discounts"
      ]
    },
    {
      category: "Tickets & Entry",
      articles: [
        "Receiving your digital ticket",
        "Using QR codes for entry",
        "What to do if you lose your ticket",
        "Transferring tickets to friends",
        "Offline ticket validation"
      ]
    },
    {
      category: "Troubleshooting",
      articles: [
        "App not working properly",
        "Payment failed or declined",
        "Can't access my tickets",
        "Refund policies and process",
        "Contact venue directly"
      ]
    }
  ];

  const supportMetrics = [
    {
      metric: "First Response Time",
      target: "< 5 minutes",
      current: "N/A",
      importance: "Critical for user satisfaction"
    },
    {
      metric: "Resolution Rate",
      target: "> 95%",
      current: "N/A", 
      importance: "Measure of support effectiveness"
    },
    {
      metric: "Customer Satisfaction",
      target: "> 4.5/5",
      current: "N/A",
      importance: "Overall support quality indicator"
    },
    {
      metric: "Escalation Rate",
      target: "< 10%",
      current: "N/A",
      importance: "Agent capability indicator"
    }
  ];

  const supportTools = [
    {
      tool: "Zendesk",
      purpose: "Ticket management and tracking",
      cost: "$49/month",
      features: ["Multi-channel support", "Knowledge base", "Analytics", "Automation"]
    },
    {
      tool: "WhatsApp Business API",
      purpose: "WhatsApp customer support",
      cost: "$0.05/message",
      features: ["Automated responses", "Rich media", "Templates", "Analytics"]
    },
    {
      tool: "Intercom",
      purpose: "In-app messaging and chat",
      cost: "$87/month",
      features: ["Live chat", "Bot automation", "User context", "Integrations"]
    },
    {
      tool: "Twilio Voice",
      purpose: "Phone support infrastructure",
      cost: "$0.02/minute",
      features: ["Call routing", "Recording", "Analytics", "Multi-language"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Support Setup</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive support infrastructure to ensure exceptional customer experience across all touchpoints
        </p>
      </div>

      {/* Support Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Response Time</h3>
            <p className="text-2xl font-bold text-blue-600">&lt; 5min</p>
            <p className="text-sm text-gray-600">Average first response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Team Size</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-600">Support specialists</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Channels</h3>
            <p className="text-2xl font-bold text-purple-600">4</p>
            <p className="text-sm text-gray-600">Support channels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold">Availability</h3>
            <p className="text-2xl font-bold text-yellow-600">24/7</p>
            <p className="text-sm text-gray-600">Automated support</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Channel Support Strategy</CardTitle>
          <p className="text-gray-600">Comprehensive customer support across preferred communication channels</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {supportChannels.map((channel, channelIndex) => (
              <div key={channelIndex} className="border rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {channel.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.channel}</h3>
                    <p className="text-gray-600 mb-4">{channel.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Hours</p>
                        <p className="text-gray-600">{channel.hours}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Response Time</p>
                        <p className="text-gray-600">{channel.responseTime}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Capacity</p>
                        <p className="text-gray-600">{channel.capacity}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Cost/Contact</p>
                        <p className="text-gray-600">{channel.costPerContact}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {channel.languages.map((language, langIndex) => (
                          <Badge key={langIndex} variant="outline" className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Support Team Structure</CardTitle>
          <p className="text-gray-600">Skilled team setup for comprehensive customer care</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {supportTeamStructure.map((role, roleIndex) => (
              <div key={roleIndex} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.role}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge className="bg-blue-100 text-blue-800">{role.count} {role.count > 1 ? 'positions' : 'position'}</Badge>
                      <Badge variant="outline">{role.salary}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Key Responsibilities</p>
                    <ul className="space-y-1">
                      {role.responsibilities.map((resp, respIndex) => (
                        <li key={respIndex} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {role.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Service Knowledge Base</CardTitle>
          <p className="text-gray-600">Comprehensive help articles to reduce support load</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {knowledgeBase.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Support Technology Stack</CardTitle>
          <p className="text-gray-600">Tools and platforms for efficient customer support</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {supportTools.map((tool, toolIndex) => (
              <div key={toolIndex} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900">{tool.tool}</h3>
                    <Badge variant="outline">{tool.cost}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tool.purpose}</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Support Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {supportMetrics.map((metric, metricIndex) => (
              <div key={metricIndex} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{metric.metric}</h3>
                  <p className="text-sm text-gray-600">{metric.importance}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{metric.target}</p>
                  <p className="text-sm text-gray-500">Target</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Support Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Support Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">$6,400</p>
              <p className="text-sm text-gray-600">Staff salaries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">$500</p>
              <p className="text-sm text-gray-600">Tools & software</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">$300</p>
              <p className="text-sm text-gray-600">Communication costs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">$7,200</p>
              <p className="text-sm text-gray-600">Total monthly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSupport;