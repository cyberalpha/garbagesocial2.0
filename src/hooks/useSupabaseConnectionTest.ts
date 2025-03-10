
import { useState, useEffect, useRef } from 'react';
import { SUPABASE_CONFIG, testSupabaseConnection } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const testAttemptRef = useRef(0);

  const testConnection = async () => {
    // Clear any previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLoading(true);
    setIsConnected(null);
    setErrorMessage(null);
    testAttemptRef.current++;
    const currentAttempt = testAttemptRef.current;
    
    // Set a timeout of 45 segundos (aumentado para redes lentas)
    timeoutRef.current = setTimeout(() => {
      // Solo procesamos si es el intento más reciente
      if (currentAttempt === testAttemptRef.current) {
        console.log("Supabase connection timeout reached (45s)");
        setIsLoading(false);
        setIsConnected(false);
        setErrorMessage("Tiempo de espera agotado (45s). Verifica tu red y configuración de Supabase.");
        setConsecutiveFailures(prev => prev + 1);
        toast({
          title: "Tiempo de conexión agotado",
          description: "La conexión con Supabase ha excedido el tiempo de espera de 45 segundos. Podría ser un problema de red o del servidor.",
          variant: "destructive"
        });
      }
    }, 45000); // 45 segundos de timeout
    
    try {
      console.log("Intentando conectar a Supabase...");
      console.log("Supabase URL:", SUPABASE_CONFIG.url);
      
      // Usamos directamente la función mejorada de testSupabaseConnection
      const isConnectedSuccessfully = await testSupabaseConnection();
      
      // Solo procesamos si es el intento más reciente
      if (currentAttempt === testAttemptRef.current) {
        // Clear timeout since we got a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (isConnectedSuccessfully) {
          console.log("Conexión con Supabase exitosa!");
          setIsConnected(true);
          setConsecutiveFailures(0);
          setErrorMessage(null);
          toast({
            title: "Conexión exitosa",
            description: "La aplicación está correctamente conectada a Supabase.",
          });
        } else {
          console.error("Fallo al conectar con Supabase");
          setIsConnected(false);
          setErrorMessage("No se pudo establecer conexión con Supabase. Verifica tu configuración.");
          setConsecutiveFailures(prev => prev + 1);
          toast({
            title: "Error de conexión",
            description: "No se pudo establecer conexión con Supabase. Verifica tu configuración y red.",
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      // Solo procesamos si es el intento más reciente
      if (currentAttempt === testAttemptRef.current) {
        // Clear timeout since we got a response (error)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        console.error("Error de conexión:", error);
        setIsConnected(false);
        setErrorMessage(error.message || "Error desconocido");
        setConsecutiveFailures(prev => prev + 1);
        toast({
          title: "Error de conexión",
          description: "Ocurrió un error al conectar con Supabase: " + error.message,
          variant: "destructive"
        });
      }
    } finally {
      // Solo procesamos si es el intento más reciente
      if (currentAttempt === testAttemptRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isLoading,
    errorMessage,
    consecutiveFailures,
    testConnection
  };
};
