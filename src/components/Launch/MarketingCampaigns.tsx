import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Megaphone, Target, Users, TrendingUp, Calendar, DollarSign, Share2, Heart } from 'lucide-react';

const MarketingCampaigns = () => {
  const campaigns = [
    {
      phase: "Pre-Launch Buzz (Week 1-4)",
      budget: "$5,000",
      objective: "Build awareness and anticipation",
      campaigns: [
        {
          name: "Social Media Teaser Campaign",
          platform: "Facebook, Instagram, TikTok",
          budget: "$2,000",
          duration: "4 weeks",
          target: "18-35 urban professionals",
          kpis: ["50K reach", "5K engagements", "1K followers"],
          content: "Behind-the-scenes venue prep, countdown posts, early bird announcements"
        },
        {
          name: "Influencer Partnerships",
          platform: "Instagram, TikTok",
          budget: "$1,500", 
          duration: "3 weeks",
          target: "Entertainment & lifestyle followers",
          kpis: ["100K impressions", "2% engagement rate", "500 app visits"],
          content: "Event previews, exclusive access, lifestyle integration"
        },
        {
          name: "PR & Media Outreach",
          platform: "Radio, newspapers, blogs",
          budget: "$1,000",
          duration: "4 weeks",
          target: "General public awareness",
          kpis: ["10 media mentions", "5 interviews", "Brand recognition boost"],
          content: "Press releases, founder interviews, industry impact stories"
        },
        {
          name: "Email Pre-Launch Series",
          platform: "Email marketing",
          budget: "$500",
          duration: "4 weeks",
          target: "Early subscribers & beta users",
          kpis: ["1K subscribers", "40% open rate", "10% click rate"],
          content: "Exclusive previews, early access offers, launch countdown"
        }
      ]
    },
    {
      phase: "Launch Blitz (Week 5-8)",
      budget: "$8,000",
      objective: "Drive immediate adoption and first purchases",
      campaigns: [
        {
          name: "Grand Launch Campaign",
          platform: "Multi-channel",
          budget: "$3,000",
          duration: "2 weeks",
          target: "Event-goers in Harare",
          kpis: ["1K app downloads", "500 tickets sold", "20% conversion"],
          content: "Launch announcements, special offers, success stories"
        },
        {
          name: "EcoCash Partnership Marketing",
          platform: "Mobile money channels",
          budget: "$2,000",
          duration: "4 weeks", 
          target: "EcoCash users",
          kpis: ["100K EcoCash notifications", "2K payment attempts", "85% success rate"],
          content: "Payment convenience messaging, cashback offers, mobile-first ads"
        },
        {
          name: "Venue Cross-Promotion",
          platform: "Venue networks",
          budget: "$1,500",
          duration: "4 weeks",
          target: "Existing venue customers",
          kpis: ["50 venue partnerships", "10K foot traffic exposure", "500 QR scans"],
          content: "In-venue promotions, QR codes, staff recommendations"
        },
        {
          name: "First-User Incentive Program",
          platform: "App-based",
          budget: "$1,500",
          duration: "3 weeks",
          target: "First-time ticket buyers",
          kpis: ["1K first purchases", "60% return rate", "Net Promoter Score 8+"],
          content: "Welcome bonuses, referral rewards, loyalty program launch"
        }
      ]
    },
    {
      phase: "Growth & Scale (Week 9-12)",
      budget: "$12,000",
      objective: "Establish market leadership and expand reach",
      campaigns: [
        {
          name: "Market Domination Campaign",
          platform: "Mass media + digital",
          budget: "$5,000",
          duration: "4 weeks",
          target: "All Harare event-goers",
          kpis: ["50% market awareness", "80% preference vs competitors", "Market leader positioning"],
          content: "Success stories, market stats, competitive advantages"
        },
        {
          name: "Bulawayo Expansion Launch",
          platform: "Multi-channel",
          budget: "$3,000",
          duration: "3 weeks",
          target: "Bulawayo entertainment market",
          kpis: ["10K Bulawayo app downloads", "5 venue partnerships", "500 tickets sold"],
          content: "Local partnerships, regional success stories, community engagement"
        },
        {
          name: "Customer Success & Advocacy",
          platform: "User-generated content",
          budget: "$2,000",
          duration: "4 weeks",
          target: "Existing customers",
          kpis: ["500 user testimonials", "1K social shares", "40% referral rate"],
          content: "Success stories, user spotlights, community building"
        },
        {
          name: "Corporate & B2B Outreach",
          platform: "LinkedIn, direct sales",
          budget: "$2,000",
          duration: "4 weeks",
          target: "Event organizers, corporate clients",
          kpis: ["50 B2B leads", "10 enterprise partnerships", "$50K pipeline"],
          content: "ROI demonstrations, enterprise features, case studies"
        }
      ]
    }
  ];

  const marketingChannels = [
    {
      channel: "Social Media",
      allocation: "35%",
      platforms: ["Facebook", "Instagram", "TikTok", "Twitter"],
      focus: "Brand awareness, engagement, community building",
      expectedROI: "4:1"
    },
    {
      channel: "Influencer Marketing",
      allocation: "20%",
      platforms: ["Instagram", "TikTok", "YouTube"],
      focus: "Authentic endorsements, lifestyle integration",
      expectedROI: "5:1"
    },
    {
      channel: "Digital Advertising",
      allocation: "25%",
      platforms: ["Google Ads", "Facebook Ads", "Mobile banners"],
      focus: "Direct response, app downloads, conversions",
      expectedROI: "6:1"
    },
    {
      channel: "PR & Partnerships",
      allocation: "15%",
      platforms: ["Media outlets", "Radio", "Newspapers"],
      focus: "Credibility, mass reach, thought leadership",
      expectedROI: "3:1"
    },
    {
      channel: "Event Marketing",
      allocation: "5%",
      platforms: ["Venues", "Events", "Activations"],
      focus: "Direct engagement, demonstrations, conversions",
      expectedROI: "8:1"
    }
  ];

  const contentCalendar = [
    { week: 1, theme: "Anticipation", content: "Coming Soon teasers, behind-the-scenes" },
    { week: 2, theme: "Innovation", content: "Technology features, convenience benefits" },
    { week: 3, theme: "Community", content: "Local venues, cultural connection" },
    { week: 4, theme: "Countdown", content: "Launch countdown, early access" },
    { week: 5, theme: "Launch", content: "Grand opening, live demonstrations" },
    { week: 6, theme: "Success", content: "User testimonials, milestone celebrations" },
    { week: 7, theme: "Expansion", content: "New venues, growing network" },
    { week: 8, theme: "Optimization", content: "Feature improvements, user feedback" },
    { week: 9, theme: "Leadership", content: "Market position, competitive advantages" },
    { week: 10, theme: "Growth", content: "New markets, scaling success" },
    { week: 11, theme: "Community", content: "User-generated content, advocacy" },
    { week: 12, theme: "Future", content: "Roadmap preview, what's next" }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Marketing Campaign Strategy</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive marketing roadmap to establish ZimEventPro as Zimbabwe's #1 ticketing platform
        </p>
      </div>

      {/* Marketing Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">Total Budget</h3>
            <p className="text-2xl font-bold text-green-600">$25K</p>
            <p className="text-sm text-gray-600">3-month campaign</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Target Reach</h3>
            <p className="text-2xl font-bold text-blue-600">500K</p>
            <p className="text-sm text-gray-600">Zimbabweans reached</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">App Downloads</h3>
            <p className="text-2xl font-bold text-purple-600">10K+</p>
            <p className="text-sm text-gray-600">Target downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold">Expected ROI</h3>
            <p className="text-2xl font-bold text-yellow-600">5:1</p>
            <p className="text-sm text-gray-600">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Phases */}
      {campaigns.map((phase, phaseIndex) => (
        <Card key={phaseIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{phase.phase}</CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{phase.budget}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{phase.objective}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {phase.campaigns.map((campaign, campaignIndex) => (
                <div key={campaignIndex} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="font-medium text-gray-700">Platform</p>
                          <p className="text-gray-600">{campaign.platform}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Budget</p>
                          <p className="text-gray-600">{campaign.budget}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Duration</p>
                          <p className="text-gray-600">{campaign.duration}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Target</p>
                          <p className="text-gray-600">{campaign.target}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-medium text-gray-700 mb-2">Content Strategy</p>
                    <p className="text-gray-600 text-sm">{campaign.content}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Key Performance Indicators</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.kpis.map((kpi, kpiIndex) => (
                        <Badge key={kpiIndex} variant="outline" className="text-xs">
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Marketing Channel Mix */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Channel Allocation</CardTitle>
          <p className="text-gray-600">Strategic budget distribution across channels</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {marketingChannels.map((channel, channelIndex) => (
              <div key={channelIndex} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900">{channel.channel}</h3>
                    <Badge className="bg-green-100 text-green-800">{channel.allocation}</Badge>
                    <Badge variant="outline">ROI: {channel.expectedROI}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{channel.focus}</p>
                  <div className="flex flex-wrap gap-2">
                    {channel.platforms.map((platform, platformIndex) => (
                      <Badge key={platformIndex} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={parseInt(channel.allocation)} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>12-Week Content Calendar</CardTitle>
          <p className="text-gray-600">Thematic content strategy for consistent messaging</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentCalendar.map((week, weekIndex) => (
              <div key={weekIndex} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Week {week.week}</span>
                  <Badge variant="outline">{week.theme}</Badge>
                </div>
                <p className="text-sm text-gray-600">{week.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Success Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">500K</p>
              <p className="text-sm text-gray-600">Total reach</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">10K</p>
              <p className="text-sm text-gray-600">App downloads</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">5K</p>
              <p className="text-sm text-gray-600">Tickets sold</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">50%</p>
              <p className="text-sm text-gray-600">Market awareness</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingCampaigns;