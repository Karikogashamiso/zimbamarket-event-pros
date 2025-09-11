import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, Users, MapPin, Calendar, DollarSign, Star, CheckCircle, Clock } from 'lucide-react';

const VendorOnboarding = () => {
  const onboardingPhases = [
    {
      phase: "Phase 1: Pilot Partners (Week 1-2)",
      description: "Strategic partnerships with premium venues",
      venues: [
        {
          name: "The Venue Lounge",
          location: "Harare CBD",
          type: "Nightclub",
          capacity: 500,
          currentStatus: "Signed",
          monthlyEvents: 8,
          avgTicketPrice: 15,
          reputation: "Premium"
        },
        {
          name: "Aqua Nightclub",
          location: "Borrowdale",
          type: "Nightclub", 
          capacity: 800,
          currentStatus: "In Discussion",
          monthlyEvents: 12,
          avgTicketPrice: 20,
          reputation: "Premium"
        },
        {
          name: "Club Connect",
          location: "Avondale",
          type: "Social Club",
          capacity: 300,
          currentStatus: "Interested",
          monthlyEvents: 6,
          avgTicketPrice: 10,
          reputation: "Growing"
        }
      ]
    },
    {
      phase: "Phase 2: Market Expansion (Week 3-6)",
      description: "Broaden reach across Harare entertainment venues",
      venues: [
        {
          name: "Book Café",
          location: "Fife Avenue",
          type: "Live Music",
          capacity: 200,
          currentStatus: "Pipeline",
          monthlyEvents: 16,
          avgTicketPrice: 8,
          reputation: "Cultural Hub"
        },
        {
          name: "Reps Theatre",
          location: "Belgravia",
          type: "Theatre",
          capacity: 400,
          currentStatus: "Pipeline",
          monthlyEvents: 10,
          avgTicketPrice: 12,
          reputation: "Established"
        },
        {
          name: "Pakare Paye Arts Centre",
          location: "Msasa",
          type: "Arts Venue",
          capacity: 1000,
          currentStatus: "Pipeline",
          monthlyEvents: 4,
          avgTicketPrice: 15,
          reputation: "Premier"
        }
      ]
    },
    {
      phase: "Phase 3: National Rollout (Week 7-12)",
      description: "Expand to Bulawayo and Victoria Falls",
      venues: [
        {
          name: "Large City Club",
          location: "Bulawayo Central",
          type: "Nightclub",
          capacity: 600,
          currentStatus: "Research",
          monthlyEvents: 8,
          avgTicketPrice: 12,
          reputation: "Regional Leader"
        },
        {
          name: "Victoria Falls Safari Lodge",
          location: "Victoria Falls",
          type: "Resort Events",
          capacity: 300,
          currentStatus: "Research", 
          monthlyEvents: 12,
          avgTicketPrice: 25,
          reputation: "Tourist Hub"
        }
      ]
    }
  ];

  const onboardingProcess = [
    {
      step: 1,
      title: "Initial Contact & Pitch",
      duration: "1-2 days",
      description: "Present ZimEventPro value proposition",
      deliverables: ["Pitch deck", "Demo account", "ROI projections"],
      responsible: "Sales Team"
    },
    {
      step: 2,
      title: "Technical Integration",
      duration: "3-5 days",
      description: "Set up venue profile and event templates",
      deliverables: ["Venue dashboard", "Staff training", "Test events"],
      responsible: "Tech Team"
    },
    {
      step: 3,
      title: "Marketing Collaboration",
      duration: "1-2 days",
      description: "Co-marketing strategy and materials",
      deliverables: ["Joint campaigns", "Cross-promotion", "Launch event"],
      responsible: "Marketing Team"
    },
    {
      step: 4,
      title: "Go-Live & Support",
      duration: "Ongoing",
      description: "Launch first events with full support",
      deliverables: ["Live events", "Performance monitoring", "Optimization"],
      responsible: "Account Management"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Signed': return 'bg-green-100 text-green-800';
      case 'In Discussion': return 'bg-blue-100 text-blue-800';
      case 'Interested': return 'bg-yellow-100 text-yellow-800';
      case 'Pipeline': return 'bg-gray-100 text-gray-800';
      case 'Research': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Premier': return 'bg-indigo-100 text-indigo-800';
      case 'Established': return 'bg-blue-100 text-blue-800';
      case 'Growing': return 'bg-green-100 text-green-800';
      case 'Cultural Hub': return 'bg-orange-100 text-orange-800';
      case 'Regional Leader': return 'bg-red-100 text-red-800';
      case 'Tourist Hub': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Vendor Onboarding Strategy</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Strategic partnership development across Zimbabwe's premier entertainment venues
        </p>
      </div>

      {/* Onboarding Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Target Venues</h3>
            <p className="text-2xl font-bold text-blue-600">50+</p>
            <p className="text-sm text-gray-600">By Month 3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Monthly Events</h3>
            <p className="text-2xl font-bold text-green-600">200+</p>
            <p className="text-sm text-gray-600">Across all venues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Revenue Share</h3>
            <p className="text-2xl font-bold text-purple-600">8-12%</p>
            <p className="text-sm text-gray-600">Commission structure</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold">Success Rate</h3>
            <p className="text-2xl font-bold text-yellow-600">80%+</p>
            <p className="text-sm text-gray-600">Conversion target</p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Phases */}
      {onboardingPhases.map((phase, phaseIndex) => (
        <Card key={phaseIndex}>
          <CardHeader>
            <CardTitle className="text-xl">{phase.phase}</CardTitle>
            <p className="text-gray-600">{phase.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {phase.venues.map((venue, venueIndex) => (
                <div key={venueIndex} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {venue.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(venue.currentStatus)}>
                        {venue.currentStatus}
                      </Badge>
                      <Badge className={`${getReputationColor(venue.reputation)} ml-2`}>
                        {venue.reputation}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Type</p>
                      <p className="text-gray-600">{venue.type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Capacity</p>
                      <p className="text-gray-600">{venue.capacity} people</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Monthly Events</p>
                      <p className="text-gray-600">{venue.monthlyEvents} events</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Avg. Ticket</p>
                      <p className="text-gray-600">${venue.avgTicketPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Onboarding Process */}
      <Card>
        <CardHeader>
          <CardTitle>4-Step Onboarding Process</CardTitle>
          <p className="text-gray-600">Streamlined approach for quick venue activation</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {onboardingProcess.map((step, stepIndex) => (
              <div key={stepIndex} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">{step.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <Badge variant="outline">{step.duration}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Deliverables</p>
                      <div className="flex flex-wrap gap-2">
                        {step.deliverables.map((deliverable, delIndex) => (
                          <Badge key={delIndex} variant="outline" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">Owner</p>
                      <p className="text-sm text-blue-600">{step.responsible}</p>
                    </div>
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
          <CardTitle>Partnership Success Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">3</p>
              <p className="text-sm text-gray-600">Pilot venues signed (Month 1)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">15</p>
              <p className="text-sm text-gray-600">Active venues (Month 2)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">50+</p>
              <p className="text-sm text-gray-600">Total partnerships (Month 3)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOnboarding;