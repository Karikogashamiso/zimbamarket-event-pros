import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

// Generic section skeleton with proper dimensions
export const SectionSkeleton = ({ 
  className, 
  height = "h-96", 
  children 
}: { 
  className?: string; 
  height?: string; 
  children?: React.ReactNode; 
}) => (
  <section className={cn("py-16", className)}>
    <div className="container mx-auto px-4">
      <div className={cn("animate-pulse", height)}>
        {children || <Skeleton className="w-full h-full rounded-2xl" />}
      </div>
    </div>
  </section>
);

// Hero section skeleton with proper aspect ratio
export const HeroSectionSkeleton = () => (
  <section className="relative min-h-screen flex items-center justify-center">
    <AspectRatio ratio={16 / 9} className="w-full">
      <Skeleton className="w-full h-full" />
    </AspectRatio>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <Skeleton className="h-4 w-32 mx-auto rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-96 mx-auto" />
          <Skeleton className="h-16 w-80 mx-auto" />
          <Skeleton className="h-16 w-72 mx-auto" />
        </div>
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-36" />
        </div>
      </div>
    </div>
  </section>
);

// Featured listings skeleton with proper card dimensions
export const FeaturedListingsSkeleton = () => (
  <SectionSkeleton className="py-24 bg-gradient-to-br from-background via-muted/10 to-background" height="h-auto">
    <div className="text-center mb-16 space-y-4">
      <Skeleton className="h-8 w-48 mx-auto rounded-full" />
      <Skeleton className="h-16 w-96 mx-auto" />
      <Skeleton className="h-6 w-3/4 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden card-elegant">
          <AspectRatio ratio={4 / 3}>
            <Skeleton className="w-full h-full" />
          </AspectRatio>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="text-center">
      <Skeleton className="h-12 w-48 mx-auto" />
    </div>
  </SectionSkeleton>
);

// Category section skeleton
export const CategorySectionSkeleton = () => (
  <SectionSkeleton className="bg-gradient-to-br from-background to-muted/30" height="h-auto">
    <div className="text-center mb-12 space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-card rounded-3xl p-6 border border-border/50">
          <div className="flex flex-col items-center text-center space-y-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
      ))}
    </div>
  </SectionSkeleton>
);

// Stats section skeleton
export const StatsSectionSkeleton = () => (
  <SectionSkeleton className="py-16 bg-gradient-to-r from-primary/5 via-background to-accent/5" height="h-auto">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
          <Skeleton className="h-10 w-24 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      ))}
    </div>
    <div className="flex justify-center gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-32" />
      ))}
    </div>
  </SectionSkeleton>
);

// Trending services skeleton
export const TrendingServicesSkeleton = () => (
  <SectionSkeleton className="py-24 bg-gradient-to-br from-background via-muted/20 to-background" height="h-auto">
    <div className="flex items-center justify-between mb-16">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-24 h-6" />
        </div>
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-6 w-96" />
      </div>
      <Skeleton className="hidden md:block w-24 h-10" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden card-elegant">
          <AspectRatio ratio={16 / 9}>
            <Skeleton className="w-full h-full" />
          </AspectRatio>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </SectionSkeleton>
);

// Generic testimonials skeleton
export const TestimonialsSkeleton = () => (
  <SectionSkeleton height="h-auto">
    <div className="text-center mb-12 space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-4 w-20" />
        </Card>
      ))}
    </div>
  </SectionSkeleton>
);

// Location section skeleton
export const LocationSectionSkeleton = () => (
  <SectionSkeleton height="h-auto">
    <div className="text-center mb-12 space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
        </Card>
      ))}
    </div>
  </SectionSkeleton>
);