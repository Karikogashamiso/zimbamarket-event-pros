import React, { lazy, Suspense, useEffect } from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MetaTags from "@/components/SEO/MetaTags";
import StructuredData from "@/components/SEO/StructuredData";
import InstallPrompt from "@/components/PWA/InstallPrompt";
import NetworkStatus from "@/components/PWA/NetworkStatus";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import { measureWebVitals, monitorPerformanceBudget } from "@/utils/performance";
import {
  StatsSectionSkeleton,
  CategorySectionSkeleton,
  TrendingServicesSkeleton,
  FeaturedListingsSkeleton,
  TestimonialsSkeleton,
  LocationSectionSkeleton,
  SectionSkeleton
} from "@/components/ui/section-skeleton";

// Lazy load components for better performance
const CategorySection = lazy(() => import("@/components/CategorySection"));
const FeaturedListings = lazy(() => import("@/components/FeaturedListings"));
const LocationSection = lazy(() => import("@/components/LocationSection"));
const TrustSection = lazy(() => import("@/components/TrustSection"));
const BusinessCTASection = lazy(() => import("@/components/BusinessCTASection"));
const NewsletterSection = lazy(() => import("@/components/NewsletterSection"));
const Footer = lazy(() => import("@/components/Footer"));
const SmartRecommendations = lazy(() => import("@/components/Recommendations/SmartRecommendations"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const TestimonialsCarousel = lazy(() => import("@/components/TestimonialsCarousel"));
const TrendingServices = lazy(() => import("@/components/TrendingServices"));
const FloatingActionButton = lazy(() => import("@/components/FloatingActionButton"));

const Index = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    measureWebVitals((metric) => {
      console.log('Web Vital:', metric);
      
      // Send to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_rating: metric.rating,
          custom_parameter: 'web_vitals'
        });
      }
    });

    // Monitor performance budget
    monitorPerformanceBudget();
  }, []);

  const organizationData = {
    name: "ZimEventPro",
    url: "https://zimeventpro.com",
    logo: "https://zimeventpro.com/logo.png",
    description: "Zimbabwe's premier event planning marketplace connecting clients with trusted professionals",
    city: "Harare",
    phone: "+263-XXX-XXXX",
    socialLinks: [
      "https://facebook.com/zimeventpro",
      "https://instagram.com/zimeventpro",
      "https://twitter.com/zimeventpro"
    ]
  };

  const websiteData = {
    url: "https://zimeventpro.com",
    name: "ZimEventPro - Event Planning Marketplace",
    description: "Find and book trusted event professionals across Zimbabwe. Venues, caterers, DJs, photographers and more."
  };

  return (
    <>
      <MetaTags
        title="ZimEventPro - Find Event Professionals Across Zimbabwe"
        description="Discover and book trusted event professionals across Zimbabwe. Find venues, caterers, DJs, photographers, and more for your perfect celebration."
        keywords="event planning Zimbabwe, wedding venues Harare, party planners Zimbabwe, event services, catering services Zimbabwe"
        type="website"
        image="/og-image.jpg"
        url="https://zimeventpro.com"
      />
      <GoogleAnalytics measurementId="GA_MEASUREMENT_ID" />
      
      <StructuredData type="Organization" data={organizationData} />
      <StructuredData type="WebSite" data={websiteData} />
      
      <div className="min-h-screen">
        <Header />
        <HeroSection />
        
        <Suspense fallback={
          <>
            <StatsSectionSkeleton />
            <CategorySectionSkeleton />
            <TrendingServicesSkeleton />
            <FeaturedListingsSkeleton />
            <TestimonialsSkeleton />
            <LocationSectionSkeleton />
            <SectionSkeleton className="py-16" />
            <SectionSkeleton className="py-16" />
            <SectionSkeleton className="py-16" />
            <SectionSkeleton className="py-12" />
          </>
        }>
          <StatsSection />
          <CategorySection />
          <TrendingServices />
          <FeaturedListings />
          <SmartRecommendations maxItems={6} />
          <TestimonialsCarousel />
          <LocationSection />
          <TrustSection />
          <BusinessCTASection />
          <NewsletterSection />
          <Footer />
        </Suspense>
        
        <InstallPrompt />
        <NetworkStatus />
        <FloatingActionButton />
      </div>
    </>
  );
};

export default Index;
