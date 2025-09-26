import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  processingTime?: number;
  error?: EmailError;
}

const classifyEmailError = (error: any): EmailError => {
  // Server/API errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection and try again.',
      retryable: true
    };
  }

  // Edge function specific errors
  if (error.error) {
    const serverError = error.error;
    
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many emails sent. Please wait a moment before trying again.',
          retryable: true
        };
      
      case 'INVALID_EMAIL_FORMAT':
        return {
          code: 'INVALID_EMAIL_FORMAT',
          message: 'Please enter a valid email address.',
          retryable: false
        };
      
      case 'EMAIL_SERVICE_NOT_CONFIGURED':
        return {
          code: 'EMAIL_SERVICE_NOT_CONFIGURED',
          message: 'Email service is temporarily unavailable. Please try again later.',
          retryable: true
        };
      
      case 'TIMEOUT_ERROR':
        return {
          code: 'TIMEOUT_ERROR',
          message: 'Email service is taking too long to respond. Please try again.',
          retryable: true
        };
      
      case 'INVALID_RECIPIENT':
        return {
          code: 'INVALID_RECIPIENT',
          message: 'This email address appears to be invalid or unreachable.',
          retryable: false
        };
      
      default:
        return {
          code: 'EMAIL_DELIVERY_FAILED',
          message: serverError || 'Failed to send email. Please try again.',
          retryable: true
        };
    }
  }

  // Generic fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true
  };
};

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<EmailError | null>(null);
  const { toast } = useToast();

  const sendVerificationEmail = async (
    email: string, 
    confirmationUrl: string, 
    firstName?: string
  ): Promise<EmailResponse> => {
    setIsLoading(true);
    setLastError(null);

    try {
      console.log(`[Email Service] Sending verification email to: ${email}`);
      
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          confirmationUrl,
          firstName,
          type: 'verification'
        }
      });

      if (error) {
        console.error('[Email Service] Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('[Email Service] Email delivery failed:', data);
        const emailError = classifyEmailError(data);
        setLastError(emailError);
        
        toast({
          title: "Email Delivery Failed",
          description: emailError.message,
          variant: "destructive",
        });

        return {
          success: false,
          error: emailError
        };
      }

      console.log(`[Email Service] Verification email sent successfully:`, {
        messageId: data.messageId,
        processingTime: data.processingTime
      });

      return {
        success: true,
        messageId: data.messageId,
        processingTime: data.processingTime
      };

    } catch (error: any) {
      console.error('[Email Service] Unexpected error:', error);
      
      const emailError = classifyEmailError(error);
      setLastError(emailError);
      
      toast({
        title: "Email Service Error",
        description: emailError.message,
        variant: "destructive",
      });

      return {
        success: false,
        error: emailError
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (
    email: string, 
    resetUrl: string
  ): Promise<EmailResponse> => {
    setIsLoading(true);
    setLastError(null);

    try {
      console.log(`[Email Service] Sending password reset email to: ${email}`);
      
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          confirmationUrl: resetUrl,
          type: 'password_reset'
        }
      });

      if (error) {
        console.error('[Email Service] Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('[Email Service] Password reset email failed:', data);
        const emailError = classifyEmailError(data);
        setLastError(emailError);
        
        toast({
          title: "Password Reset Failed",
          description: emailError.message,
          variant: "destructive",
        });

        return {
          success: false,
          error: emailError
        };
      }

      console.log(`[Email Service] Password reset email sent successfully:`, {
        messageId: data.messageId,
        processingTime: data.processingTime
      });

      return {
        success: true,
        messageId: data.messageId,
        processingTime: data.processingTime
      };

    } catch (error: any) {
      console.error('[Email Service] Password reset error:', error);
      
      const emailError = classifyEmailError(error);
      setLastError(emailError);
      
      toast({
        title: "Password Reset Error",
        description: emailError.message,
        variant: "destructive",
      });

      return {
        success: false,
        error: emailError
      };
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastEmail = async (): Promise<void> => {
    if (!lastError?.retryable) {
      toast({
        title: "Cannot Retry",
        description: "This type of error cannot be retried automatically.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Retrying...",
      description: "Attempting to send email again.",
    });
  };

  return {
    sendVerificationEmail,
    sendPasswordResetEmail,
    retryLastEmail,
    isLoading,
    lastError,
  };
};