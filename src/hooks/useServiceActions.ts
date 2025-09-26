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
      // Check if already saved - using rpc to avoid type issues
      const { data: existingSave } = await supabase.rpc('check_saved_service', {
        user_id_param: user.id,
        service_id_param: serviceId
      });

      if (existingSave) {
        // Remove from saved
        const { error } = await supabase.rpc('remove_saved_service', {
          user_id_param: user.id,
          service_id_param: serviceId
        });

        if (error) throw new Error(error.message);

        toast({
          title: "Removed from Saved",
          description: `${serviceName} has been removed from your saved services.`,
        });
      } else {
        // Add to saved
        const { error } = await supabase.rpc('add_saved_service', {
          user_id_param: user.id,
          service_id_param: serviceId
        });

        if (error) throw new Error(error.message);

        toast({
          title: "Saved Successfully",
          description: `${serviceName} has been added to your saved services.`,
        });
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service. Please try again.",
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

      // Log sharing analytics using rpc
      try {
        await supabase.rpc('log_service_analytics', {
          service_id_param: serviceId,
          event_type_param: 'share',
          user_id_param: user?.id || null,
          event_data_param: JSON.stringify({ method: navigator.share ? 'native' : 'clipboard' })
        });
      } catch (analyticsError) {
        // Don't fail the sharing if analytics fails
        console.warn('Analytics logging failed:', analyticsError);
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
      const { error } = await supabase.rpc('create_service_report', {
        service_id_param: serviceId,
        reported_by_user_id_param: user?.id || null,
        reason_param: reason,
        report_data_param: JSON.stringify({
          service_name: serviceName,
          reported_at: new Date().toISOString(),
        })
      });

      if (error) throw new Error(error.message);

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this service. We'll review it shortly.",
      });
    } catch (error: any) {
      console.error('Error reporting service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
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