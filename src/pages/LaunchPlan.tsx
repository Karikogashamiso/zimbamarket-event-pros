import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LaunchPlanDashboard from '@/components/Launch/LaunchPlanDashboard';
import FeatureRollout from '@/components/Launch/FeatureRollout';
import VendorOnboarding from '@/components/Launch/VendorOnboarding';
import MarketingCampaigns from '@/components/Launch/MarketingCampaigns';
import CustomerSupport from '@/components/Launch/CustomerSupport';

const LaunchPlan = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ZimEventPro Launch Strategy
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Comprehensive 3-month roadmap to establish market leadership in Zimbabwe's digital ticketing space
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <LaunchPlanDashboard />
          </TabsContent>

          <TabsContent value="features" className="space-y-8">
            <FeatureRollout />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-8">
            <VendorOnboarding />
          </TabsContent>

          <TabsContent value="marketing" className="space-y-8">
            <MarketingCampaigns />
          </TabsContent>

          <TabsContent value="support" className="space-y-8">
            <CustomerSupport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LaunchPlan;