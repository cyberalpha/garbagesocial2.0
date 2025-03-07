
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstCheck = useRef(true);
  const retryDelayRef = useRef(5000); // Comenzar con 5 segundos
  const maxRetryDelay = 60000; // Máximo 1 minuto entre intentos

  const checkConnection = async () => {
    // Limpiamos cualquier timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus('connecting');
    
    // Establecemos un timeout de 15 segundos (aumentado de 10)
    timeoutRef.current = setTimeout(() => {
      console.log("Supabase connection timeout reached");
      setStatus('disconnected');
      setError("La conexión con Supabase ha excedido el tiempo de espera");
      
      // Solo mostramos notificación si no es la primera comprobación
      if (!isFirstCheck.current) {
        toast({
          title: "Problema de conexión",
          description: "No se puede conectar con Supabase. Verifica tu conexión a internet o si hay problemas con el servicio.",
          variant: "destructive"
        });
      }
      
      // Programar el próximo intento con backoff exponencial
      scheduleNextCheck();
    }, 15000);
    
    try {
      console.log("Comprobando conexión con Supabase...");
      
      // Primero verificamos si podemos obtener la sesión (autenticación)
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        throw new Error(`Error de autenticación: ${authError.message}`);
      }
      
      // Luego intentamos hacer una consulta simple para verificar el acceso a datos
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      // Limpiamos el timeout ya que obtuvimos respuesta
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (queryError) {
        console.error("Error de conexión con Supabase:", queryError);
        setStatus('disconnected');
        setError(queryError.message);
        
        // Solo mostramos notificación si no es la primera comprobación
        if (!isFirstCheck.current) {
          toast({
            title: "Error de conexión",
            description: "Error al conectar con Supabase: " + queryError.message,
            variant: "destructive"
          });
        }
        
        // Programar el próximo intento con backoff exponencial
        scheduleNextCheck();
      } else {
        console.log("Conexión con Supabase exitosa!");
        setStatus('connected');
        setError(null);
        
        // Resetear el retardo de reintento
        retryDelayRef.current = 5000;
        
        // Si estaba desconectado antes, mostramos notificación de reconexión
        if (status === 'disconnected' && !isFirstCheck.current) {
          toast({
            title: "Conexión restablecida",
            description: "La conexión con Supabase se ha restablecido correctamente.",
          });
        }
      }
      
      isFirstCheck.current = false;
      setLastChecked(new Date());
    } catch (err: any) {
      // Limpiamos el timeout ya que obtuvimos un error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.error("Error al comprobar conexión con Supabase:", err);
      setStatus('disconnected');
      setError(err.message || "Error desconocido");
      
      // Solo mostramos notificación si no es la primera comprobación
      if (!isFirstCheck.current) {
        toast({
          title: "Error de conexión",
          description: "Error al conectar con Supabase: " + (err.message || "Error desconocido"),
          variant: "destructive"
        });
      }
      
      isFirstCheck.current = false;
      setLastChecked(new Date());
      
      // Programar el próximo intento con backoff exponencial
      scheduleNextCheck();
    }
  };
  
  // Función para programar el próximo intento con backoff exponencial
  const scheduleNextCheck = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      checkConnection();
    }, retryDelayRef.current);
    
    // Aumentar el tiempo de espera para el próximo intento (exponential backoff)
    retryDelayRef.current = Math.min(retryDelayRef.current * 1.5, maxRetryDelay);
  };

  // Comprobamos la conexión al montar el componente
  useEffect(() => {
    checkConnection();
    
    // Comprobamos la conexión cada 60 segundos
    const intervalId = setInterval(() => {
      // Solo verificamos automáticamente si estamos conectados
      // Si está desconectado, el backoff exponencial se encargará
      if (status === 'connected') {
        checkConnection();
      }
    }, 60000);
    
    // Limpiamos el intervalo y timeout al desmontar
    return () => {
      clearInterval(intervalId);
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
