import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeFeaturesManager } from '@/components/Admin/HomeFeaturesManager';
import { HomeStatsManager } from '@/components/Admin/HomeStatsManager';
import { TestimonialsManager } from '@/components/Admin/TestimonialsManager';

const HomeContent = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Home Page Content Management</h1>
      
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="mt-6">
          <HomeFeaturesManager />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <HomeStatsManager />
        </TabsContent>
        
        <TabsContent value="testimonials" className="mt-6">
          <TestimonialsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeContent;
