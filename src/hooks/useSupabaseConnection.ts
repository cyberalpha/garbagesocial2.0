
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  calculateNextRetryDelay,
  checkSupabaseConnection
} from '@/utils/supabaseConnectionUtils';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface UseSupabaseConnectionResult {
  status: ConnectionStatus;
  lastChecked: Date | null;
  error: string | null;
  checkConnection: () => Promise<void>;
}

/**
 * Hook personalizado para monitorear la conexión con Supabase
 * @returns Un objeto con el estado actual de la conexión a Supabase
 */
export const useSupabaseConnection = (): UseSupabaseConnectionResult => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Referencias para el control de la conexión
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstCheck = useRef(true);
  const retryDelayRef = useRef(2000); // Comenzar con 2 segundos para ser más reactivo
  const connectionAttemptsRef = useRef(0);
  const previousStatusRef = useRef<ConnectionStatus | null>(null);
  
  // Configuración para el backoff exponencial
  const retryConfig = {
    initialDelay: 2000,
    maxRetryDelay: 30000, // Máximo 30 segundos entre intentos
    maxConsecutiveFailures: 5 // Reiniciar después de 5 fallos consecutivos
  };

  // Función para resetear el backoff
  const resetBackoff = () => {
    retryDelayRef.current = retryConfig.initialDelay;
    connectionAttemptsRef.current = 0;
  };

  // Programar próxima verificación utilizando backoff exponencial
  const scheduleNextCheck = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      checkConnection();
    }, retryDelayRef.current);
    
    console.log(`Próximo intento de conexión en ${retryDelayRef.current / 1000} segundos`);
    
    retryDelayRef.current = calculateNextRetryDelay(
      retryDelayRef.current, 
      connectionAttemptsRef.current,
      retryConfig
    );
  };

  // Verificar conexión con Supabase
  const checkConnection = async () => {
    // Limpiamos cualquier timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Guardamos el estado anterior para referencia
    previousStatusRef.current = status;
    
    const connected = await checkSupabaseConnection(
      setStatus,
      setError,
      setLastChecked,
      isFirstCheck.current,
      connectionAttemptsRef.current,
      toast,
      previousStatusRef.current
    );
    
    // Actualizamos los contadores y programamos siguiente comprobación si es necesario
    if (connected) {
      resetBackoff();
    } else {
      connectionAttemptsRef.current++;
      scheduleNextCheck();
    }
    
    isFirstCheck.current = false;
  };

  // Efecto para iniciar la verificación de conexión y programar comprobaciones periódicas
  useEffect(() => {
    checkConnection();
    
    // Comprobamos la conexión cada 30 segundos si estamos conectados
    const intervalId = setInterval(() => {
      if (status === 'connected') {
        checkConnection();
      }
    }, 30000);
    
    // Manejadores para eventos del navegador
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Ventana visible de nuevo, verificando conexión...");
        checkConnection();
      }
    };
    
    const handleOnline = () => {
      console.log("Navegador reporta conexión online, verificando Supabase...");
      checkConnection();
    };
    
    // Añadimos los event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    
    // Limpiamos los recursos al desmontar
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status]);

  return {
    status,
    lastChecked,
    error,
    checkConnection
  };
};
