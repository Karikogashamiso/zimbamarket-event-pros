import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CSRFToken {
  token: string;
  expiresAt: number;
}

export const useCSRF = () => {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateToken = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionId = sessionData?.session?.user?.id;

      const { data, error } = await supabase.functions.invoke('csrf-protection', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error generating CSRF token:', error);
        return null;
      }

      const tokenData = data as CSRFToken;
      setCSRFToken(tokenData.token);
      
      // Store token and expiration in sessionStorage
      sessionStorage.setItem('csrf_token', tokenData.token);
      sessionStorage.setItem('csrf_expires', tokenData.expiresAt.toString());
      
      return tokenData.token;
    } catch (error) {
      console.error('CSRF token generation failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    const storedToken = sessionStorage.getItem('csrf_token');
    const storedExpires = sessionStorage.getItem('csrf_expires');
    
    // Check if we have a valid stored token
    if (storedToken && storedExpires) {
      const expiresAt = parseInt(storedExpires);
      const now = Date.now();
      
      // If token expires in more than 5 minutes, use it
      if (expiresAt > now + (5 * 60 * 1000)) {
        setCSRFToken(storedToken);
        return storedToken;
      }
    }
    
    // Generate new token if none exists or expired
    return await generateToken();
  }, [generateToken]);

  const clearToken = useCallback(() => {
    setCSRFToken(null);
    sessionStorage.removeItem('csrf_token');
    sessionStorage.removeItem('csrf_expires');
  }, []);

  // Initialize token on mount
  useEffect(() => {
    getValidToken();
  }, [getValidToken]);

  return {
    csrfToken,
    loading,
    generateToken,
    getValidToken,
    clearToken
  };
};