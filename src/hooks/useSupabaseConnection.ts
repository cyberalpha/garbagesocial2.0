
import { useState, useEffect, useCallback } from 'react';
import { checkDatabaseConnection } from '@/utils/supabaseConnectionUtils';
import { supabase } from '@/integrations/supabase/client';

// Tipo para el estado de conexión
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'unknown';

// Función auxiliar para calcular el tiempo de reintento
const calculateNextRetryDelay = (attempt: number, baseDelay = 2000, maxDelay = 30000) => {
  const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), maxDelay);
  return delay;
};

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  
  // Verificar si el navegador está online
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
  
  const checkConnection = useCallback(async () => {
    if (!isOnline) {
      console.log('El navegador está offline, no se verificará la conexión');
      setStatus('disconnected');
      setErrorMessage('Sin conexión a Internet');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setStatus('connecting');
    
    try {
      // Verificar la información básica del proyecto
      const { data: projectData } = await supabase.rpc('get_project_ref');
      console.log('Información del proyecto Supabase:', projectData);
      
      // Verificar conexión a la base de datos
      const { success, error } = await checkDatabaseConnection();
      
      setIsConnected(success);
      setLastChecked(new Date());
      
      if (!success && error) {
        console.error('Error de conexión detectado:', error);
        setErrorMessage(typeof error === 'string' ? error : error.message || 'Error desconocido');
        setRetryAttempt(prev => prev + 1);
        setStatus('disconnected');
      } else {
        console.log('Conexión a Supabase exitosa');
        setRetryAttempt(0);
        setStatus('connected');
      }
    } catch (error: any) {
      console.error('Error al verificar conexión:', error);
      setIsConnected(false);
      setErrorMessage(error.message || 'Error desconocido');
      setRetryAttempt(prev => prev + 1);
      setStatus('disconnected');
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  // Efecto para verificar la conexión al montar el componente
  useEffect(() => {
    // Comprobar conexión al montar
    checkConnection();
    
    // Configurar verificaciones periódicas cada 30 segundos
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);
    
    // Escuchar eventos online/offline del navegador
    const handleOnline = () => {
      console.log('Navegador online, verificando conexión...');
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log('Navegador offline, actualizando estado...');
      setStatus('disconnected');
      setErrorMessage('Sin conexión a Internet');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Efecto para reintentar la conexión si falló anteriormente
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
