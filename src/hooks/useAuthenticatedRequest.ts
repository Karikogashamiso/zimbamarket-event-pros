import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCSRF } from './useCSRF';

interface AuthenticatedRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export const useAuthenticatedRequest = () => {
  const { getValidToken } = useCSRF();

  const makeRequest = useCallback(async (
    url: string,
    options: AuthenticatedRequestOptions = {}
  ) => {
    const { method = 'GET', headers = {}, body } = options;
    
    // For non-GET requests, include CSRF token
    if (method !== 'GET') {
      const csrfToken = await getValidToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    // For Supabase edge functions, use the built-in client
    if (url.startsWith('supabase-functions:')) {
      const functionName = url.replace('supabase-functions:', '');
      return await supabase.functions.invoke(functionName, {
        body,
        headers
      });
    }

    // For external requests
    return await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }, [getValidToken]);

  const makeSupabaseRequest = useCallback(async (
    functionName: string,
    body: any = {},
    customHeaders: Record<string, string> = {}
  ) => {
    const csrfToken = await getValidToken();
    const headers = { ...customHeaders };
    
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    return await supabase.functions.invoke(functionName, {
      body,
      headers
    });
  }, [getValidToken]);

  return {
    makeRequest,
    makeSupabaseRequest
  };
};