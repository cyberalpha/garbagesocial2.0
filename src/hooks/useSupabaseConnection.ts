
import { useState, useEffect, useCallback } from 'react';
import { checkDatabaseConnection } from '@/utils/supabaseConnectionUtils';

// Tipo para el estado de conexión
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'unknown';

// Función auxiliar para calcular el tiempo de reintento
const calculateNextRetryDelay = (attempt: number, baseDelay = 2000, maxDelay = 30000) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  return delay;
};

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  
  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatus('connecting');
    
    try {
      const { success, error } = await checkDatabaseConnection();
      
      setIsConnected(success);
      setLastChecked(new Date());
      
      if (!success && error) {
        setErrorMessage(typeof error === 'string' ? error : error.message || 'Error desconocido');
        setRetryAttempt(prev => prev + 1);
        setStatus('disconnected');
      } else {
        setRetryAttempt(0);
        setStatus('connected');
      }
    } catch (error: any) {
      console.error('Error checking Supabase connection:', error);
      setIsConnected(false);
      setErrorMessage(error.message || 'Error desconocido');
      setRetryAttempt(prev => prev + 1);
      setStatus('disconnected');
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Comprobar conexión al montar
    checkConnection();
    
    // Configurar verificaciones periódicas
    const interval = setInterval(() => {
      checkConnection();
    }, 60000); // Comprobar cada minuto
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  useEffect(() => {
    // Solo reintentar si no hay conexión y hay un error
    if (isConnected === false && errorMessage && retryAttempt > 0) {
      const retryDelay = calculateNextRetryDelay(retryAttempt);
      
      const retryTimeout = setTimeout(() => {
        console.log(`Reintentando conexión (intento ${retryAttempt})...`);
        checkConnection();
      }, retryDelay);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [isConnected, errorMessage, retryAttempt, checkConnection]);

  return {
    isConnected,
    isLoading,
    errorMessage,
    checkConnection,
    status,
    lastChecked,
    error: errorMessage
  };
};

export default useSupabaseConnection;
