
import { useState, useCallback } from 'react';
import { testConnection, offlineMode } from '@/integrations/supabase/client';

export interface ConnectionDetails {
  success: boolean;
  timestamp: number;
  latency: number | null;
  supabaseVersion: string | null;
}

// Hook para probar la conexión a Supabase
export const useSupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);

  const testConnectionFunc = useCallback(async (forceTest: boolean = false) => {
    // Si estamos en modo offline y no es un test forzado, no ejecutamos la prueba
    if (offlineMode() && !forceTest) {
      console.log('En modo offline, no se realizará la prueba de conexión');
      setIsConnected(false);
      setErrorMessage('Modo offline activado');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Verificar conexión a Supabase
      const result = await testConnection();
      const timestamp = Date.now();
      
      if (result && result.success) {
        setIsConnected(true);
        setConnectionDetails({
          success: true,
          timestamp,
          latency: result.latency || null,
          supabaseVersion: result.supabaseVersion || null
        });
      } else if (result && result.error) {
        setIsConnected(false);
        setErrorMessage(typeof result.error === 'string' 
          ? result.error 
          : (result.error && result.error.message) || 'Error desconocido');
        console.error('Error al verificar conexión:', result.error);
      } else {
        setIsConnected(false);
        setErrorMessage('No se pudo establecer conexión');
      }
    } catch (error: any) {
      setIsConnected(false);
      setErrorMessage(error.message || 'Error inesperado al verificar la conexión');
      console.error('Error en testConnection:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    errorMessage,
    testConnection: testConnectionFunc,
    connectionDetails
  };
};

export default useSupabaseConnectionTest;
