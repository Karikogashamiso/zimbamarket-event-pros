import React from 'react';
import { Helmet } from 'react-helmet-async';
import MetaTags from '@/components/SEO/MetaTags';
import StructuredData from '@/components/SEO/StructuredData';
import PerformanceMonitor from '@/components/Analytics/PerformanceMonitor';

const PerformancePage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Performance Monitor - ZimEventPro"
        description="Real-time performance monitoring dashboard showing Core Web Vitals, loading times, and optimization recommendations."
        type="website"
      />

      <StructuredData
        type="WebSite"
        data={{
          name: "ZimEventPro Performance Monitor",
          description: "Real-time performance monitoring dashboard",
          url: "https://zimeventpro.com/performance"
        }}
      />

      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-8">
          <PerformanceMonitor />
        </div>
      </div>
    </>
  );
};

export default PerformancePage;