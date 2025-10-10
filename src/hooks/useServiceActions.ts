import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useServiceActions = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveService = async (serviceId: string, serviceName: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save services to your favorites.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // For now, use localStorage as a simple implementation
      const savedServices = JSON.parse(localStorage.getItem('saved_services') || '[]');
      const isAlreadySaved = savedServices.includes(serviceId);

      if (isAlreadySaved) {
        // Remove from saved
        const updatedServices = savedServices.filter((id: string) => id !== serviceId);
        localStorage.setItem('saved_services', JSON.stringify(updatedServices));

        toast({
          title: "Removed from Saved",
          description: `${serviceName} has been removed from your saved services.`,
        });
      } else {
        // Add to saved
        const updatedServices = [...savedServices, serviceId];
        localStorage.setItem('saved_services', JSON.stringify(updatedServices));

        toast({
          title: "Saved Successfully",
          description: `${serviceName} has been added to your saved services.`,
        });
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const shareService = async (serviceId: string, serviceName: string) => {
    try {
      const currentUrl = window.location.href;
      
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: serviceName,
          text: `Check out this service: ${serviceName}`,
          url: currentUrl,
        });
        
        toast({
          title: "Shared Successfully",
          description: "Service has been shared using your device's sharing options.",
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(currentUrl);
        
        toast({
          title: "Link Copied",
          description: "Service link has been copied to your clipboard.",
        });
      }

      // Log sharing analytics (optional - skip if tables don't exist)
      try {
        await supabase.from('booking_analytics').insert({
          service_id: serviceId,
          event_type: 'share',
          user_id: user?.id || null,
          event_data: { method: navigator.share ? 'native' : 'clipboard' },
        });
      } catch (analyticsError) {
        // Silently fail analytics logging
        console.log('Analytics logging failed:', analyticsError);
      }
    } catch (error: any) {
      console.error('Error sharing service:', error);
      
      // Fallback: try to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Service link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Sharing Failed",
          description: "Unable to share or copy link. Please manually copy the URL.",
          variant: "destructive",
        });
      }
    }
  };

  const reportService = async (serviceId: string, serviceName: string, reason: string) => {
    setIsReporting(true);
    try {
      // Insert report into database
      const { error } = await supabase
        .from('service_reports')
        .insert({
          service_id: serviceId,
          reported_by_user_id: user?.id || null,
          reason: reason,
          status: 'pending',
          report_data: {
            service_name: serviceName,
            timestamp: new Date().toISOString(),
          },
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this service. We'll review it shortly.",
      });
      
      // Log to console for development
      console.log('Service reported:', {
        serviceId,
        serviceName,
        reason,
        reportedBy: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error reporting service:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  return {
    saveService,
    shareService,
    reportService,
    isSaving,
    isReporting,
  };
};