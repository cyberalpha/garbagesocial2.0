import { useState, useEffect, useCallback } from 'react';
import { checkDatabaseConnection } from '@/utils/supabaseConnectionUtils';
import { supabase, offlineMode, setOfflineMode, isOnline as browserIsOnline } from '@/integrations/supabase/client';

// Tipo para el estado de conexión
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'unknown' | 'offline';

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
  const [status, setStatus] = useState<ConnectionStatus>(offlineMode ? 'offline' : 'unknown');
  const [isOfflineMode, setIsOfflineMode] = useState(offlineMode);
  
  // Verificar si el navegador está online
  const isOnline = browserIsOnline();
  
  const checkConnection = useCallback(async () => {
    // Si estamos en modo offline, no intentamos conectar
    if (isOfflineMode) {
      console.log('En modo offline, no se verifica conexión');
      setStatus('offline');
      setErrorMessage(null);
      setIsConnected(false);
      return;
    }
    
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
  }, [isOnline, isOfflineMode]);

  // Efecto para manejar cambios en el modo offline
  useEffect(() => {
    const handleOfflineModeChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newOfflineMode = customEvent.detail?.offlineMode || false;
      console.log(`Cambio en modo offline detectado: ${newOfflineMode}`);
      setIsOfflineMode(newOfflineMode);
      setStatus(newOfflineMode ? 'offline' : 'unknown');
      
      if (!newOfflineMode) {
        // Si pasamos a modo online, verificar conexión
        checkConnection();
      }
    };
    
    window.addEventListener('offlinemodechange', handleOfflineModeChange);
    
    // Inicializar con el estado actual
    setIsOfflineMode(offlineMode);
    setStatus(offlineMode ? 'offline' : 'unknown');
    
    return () => {
      window.removeEventListener('offlinemodechange', handleOfflineModeChange);
    };
  }, [checkConnection]);

  // Efecto para verificar la conexión al montar el componente
  useEffect(() => {
    // Solo verificar si no estamos en modo offline
    if (!isOfflineMode) {
      // Comprobar conexión al montar
      checkConnection();
      
      // Configurar verificaciones periódicas cada 30 segundos
      const interval = setInterval(() => {
        if (!isOfflineMode) {
          checkConnection();
        }
      }, 30000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [checkConnection, isOfflineMode]);

  // Evento de cambio online/offline del navegador
  useEffect(() => {
    // Escuchar eventos online/offline del navegador
    const handleOnline = () => {
      console.log('Navegador online, verificando conexión...');
      if (!isOfflineMode) {
        checkConnection();
      }
    };
    
    const handleOffline = () => {
      console.log('Navegador offline, actualizando estado...');
      setStatus('disconnected');
      setErrorMessage('Sin conexión a Internet');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection, isOfflineMode]);

  // Efecto para reintentar la conexión si falló anteriormente
  useEffect(() => {
    // Solo reintentar si no estamos en modo offline, no hay conexión y hay un error
    if (!isOfflineMode && isConnected === false && errorMessage && retryAttempt > 0) {
      const retryDelay = calculateNextRetryDelay(retryAttempt);
      
      const retryTimeout = setTimeout(() => {
        console.log(`Reintentando conexión (intento ${retryAttempt})...`);
        checkConnection();
      }, retryDelay);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [isConnected, errorMessage, retryAttempt, checkConnection, isOfflineMode]);

  // Función para toggle modo offline
  const toggleOfflineMode = useCallback(() => {
    const newOfflineMode = !isOfflineMode;
    setOfflineMode(newOfflineMode);
    setIsOfflineMode(newOfflineMode);
    setStatus(newOfflineMode ? 'offline' : 'unknown');
    if (!newOfflineMode) {
      // Si pasamos a modo online, verificar conexión
      setTimeout(() => checkConnection(), 100);
    }
  }, [isOfflineMode]);

  return {
    isConnected,
    isLoading,
    errorMessage,
    checkConnection,
    status,
    lastChecked,
    error: errorMessage,
    isOfflineMode,
    toggleOfflineMode
  };
};

export default useSupabaseConnection;
