
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/integrations/supabase/client';
import { testSupabaseConnection } from '@/utils/supabaseConnectionUtils';

export const useSupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { success, error } = await testSupabaseConnection();
      
      setIsConnected(success);
      
      if (!success && error) {
        setErrorMessage(typeof error === 'string' ? error : error.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error testing Supabase connection:', error);
      setIsConnected(false);
      setErrorMessage(error.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Test connection on mount
    testConnection();
  }, [testConnection]);

  return {
    isConnected,
    isLoading,
    errorMessage,
    testConnection,
    url: SUPABASE_CONFIG.url
  };
};
