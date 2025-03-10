
import { testSupabaseConnection } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

interface RetryConfig {
  maxRetryDelay: number;
  initialDelay: number;
  maxConsecutiveFailures: number;
}

/**
 * Calcula el próximo tiempo de espera usando backoff exponencial
 */
export const calculateNextRetryDelay = (
  currentDelay: number, 
  consecutiveFailures: number,
  config: RetryConfig
): number => {
  // Reiniciamos el backoff si hemos tenido demasiados fallos consecutivos
  if (consecutiveFailures > config.maxConsecutiveFailures) {
    return config.initialDelay;
  }
  
  // Aumentar el tiempo de espera para el próximo intento (exponential backoff)
  return Math.min(currentDelay * 1.5, config.maxRetryDelay);
};

/**
 * Muestra notificaciones basadas en el estado de conexión
 */
export const showConnectionToast = (
  status: ConnectionStatus, 
  previousStatus: ConnectionStatus | null,
  isFirstCheck: boolean,
  connectionAttempts: number,
  toast: ReturnType<typeof useToast>['toast'],
  error?: string | null
): void => {
  // No mostramos notificación en la primera comprobación
  if (isFirstCheck) return;
  
  // Limitamos las notificaciones para no molestar demasiado al usuario
  if (connectionAttempts > 3) return;

  if (status === 'disconnected' && previousStatus !== 'disconnected') {
    toast({
      title: "Problema de conexión",
      description: error || "No se puede conectar con Supabase. Verificando conexión automáticamente...",
      variant: "destructive"
    });
  } else if (status === 'connected' && previousStatus === 'disconnected') {
    toast({
      title: "Conexión restablecida",
      description: "La conexión con Supabase se ha restablecido correctamente.",
    });
  }
};

/**
 * Comprueba la conexión con Supabase usando la función testSupabaseConnection
 */
export const checkSupabaseConnection = async (
  setStatus: (status: ConnectionStatus) => void,
  setError: (error: string | null) => void,
  setLastChecked: (date: Date) => void,
  isFirstCheck: boolean,
  connectionAttempts: number,
  toast: ReturnType<typeof useToast>['toast'],
  previousStatus: ConnectionStatus
): Promise<boolean> => {
  setStatus('connecting');
  console.log("Comprobando conexión con Supabase...");
  
  try {
    // Usamos la función mejorada de testSupabaseConnection
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      console.log("Conexión con Supabase exitosa!");
      setStatus('connected');
      setError(null);
      
      // Mostrar toast si estábamos desconectados antes
      showConnectionToast('connected', previousStatus, isFirstCheck, connectionAttempts, toast);
      
      return true;
    } else {
      setStatus('disconnected');
      setError("No se pudo establecer conexión con Supabase");
      
      // Mostrar toast de desconexión
      showConnectionToast('disconnected', previousStatus, isFirstCheck, connectionAttempts, toast);
      
      return false;
    }
  } catch (err: any) {
    console.error("Error al comprobar conexión con Supabase:", err);
    setStatus('disconnected');
    setError(err.message || "Error desconocido");
    
    // Mostrar toast con el error
    showConnectionToast('disconnected', previousStatus, isFirstCheck, connectionAttempts, toast, err.message);
    
    return false;
  } finally {
    setLastChecked(new Date());
  }
};
