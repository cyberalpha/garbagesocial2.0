
import { useState, useEffect, useCallback } from 'react';
import { testSupabaseConnection } from '@/utils/supabaseConnectionUtils';
import { offlineMode } from '@/integrations/supabase/client';

export const useSupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const testConnection = useCallback(async () => {
    // Si estamos en modo offline, no intentamos probar la conexión
    if (offlineMode) {
      setIsConnected(false);
      setErrorMessage('Modo offline activado');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await testSupabaseConnection();
      
      console.log('Resultado de prueba de conexión:', result);
      setIsConnected(result.success);
      
      if (!result.success && result.error) {
        setErrorMessage(
          typeof result.error === 'string' 
            ? result.error 
            : result.error.message || 'Error al conectar con Supabase'
        );
      }
    } catch (error: any) {
      console.error('Error en prueba de conexión:', error);
      setIsConnected(false);
      setErrorMessage(error.message || 'Error inesperado al probar conexión');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Efecto para manejar cambios en el modo offline
  useEffect(() => {
    const handleOfflineModeChange = () => {
      if (offlineMode) {
        setIsConnected(false);
        setErrorMessage('Modo offline activado');
      } else {
        // Cuando se desactiva el modo offline, reiniciamos el estado
        setIsConnected(null);
        setErrorMessage(null);
      }
    };
    
    window.addEventListener('offlinemodechange', handleOfflineModeChange);
    
    // Inicializamos el estado según el modo actual
    if (offlineMode) {
      setIsConnected(false);
      setErrorMessage('Modo offline activado');
    }
    
    return () => {
      window.removeEventListener('offlinemodechange', handleOfflineModeChange);
    };
  }, []);
  
  // Efecto para probar la conexión al montar el componente
  useEffect(() => {
    // Solo probamos la conexión si no estamos en modo offline
    if (!offlineMode) {
      testConnection();
    }
  }, [testConnection]);
  
  return {
    isConnected,
    isLoading,
    errorMessage,
    testConnection
  };
};

export default useSupabaseConnectionTest;
