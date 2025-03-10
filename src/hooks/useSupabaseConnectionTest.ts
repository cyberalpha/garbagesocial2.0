
import { useState, useCallback, useEffect } from 'react';
import { testConnection as testSupabaseConnection, offlineMode } from '@/integrations/supabase/client';

interface ConnectionDetails {
  latency?: number;
  timestamp?: number;
  supabaseVersion?: string;
}

export const useSupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  
  const testConnection = useCallback(async (forceTest = false) => {
    // Si está en modo offline y no se ha forzado la prueba, no hacer nada
    if (offlineMode && !forceTest) {
      console.log('En modo offline, omitiendo prueba de conexión');
      setIsConnected(false);
      setErrorMessage("Modo offline activado");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Iniciando prueba de conexión a Supabase...');
      const result = await testSupabaseConnection();
      
      setIsConnected(result.success);
      setConnectionDetails({
        latency: result.latency,
        timestamp: Date.now(),
        // Only access version if it exists on the result object
        supabaseVersion: 'version' in result ? result.version : 'Desconocida'
      });
      
      if (!result.success && result.error) {
        console.error('Error de conexión:', result.error);
        setErrorMessage(typeof result.error === 'string' ? result.error : result.error.message || 'Error desconocido');
      } else if (result.success) {
        console.log('Conexión exitosa a Supabase');
        setErrorMessage(null);
      }
    } catch (error: any) {
      console.error('Error inesperado durante prueba de conexión:', error);
      setIsConnected(false);
      setErrorMessage(error.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efecto para probar la conexión al montar
  useEffect(() => {
    // Solo probar si no estamos en modo offline
    if (!offlineMode) {
      testConnection();
    } else {
      setIsConnected(false);
      setErrorMessage("Modo offline activado");
    }
  }, [offlineMode, testConnection]);
  
  return { 
    isConnected, 
    isLoading, 
    errorMessage, 
    testConnection,
    connectionDetails
  };
};

export default useSupabaseConnectionTest;
