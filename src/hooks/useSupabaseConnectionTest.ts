
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
    
    // Set a timeout of 10 seconds
    timeoutRef.current = setTimeout(() => {
      // Solo procesamos si es el intento más reciente
      if (currentAttempt === testAttemptRef.current) {
        console.log("Supabase connection timeout reached");
        setIsLoading(false);
        setIsConnected(false);
        setErrorMessage("Tiempo de espera agotado. Verifica tu red y configuración de Supabase.");
        setConsecutiveFailures(prev => prev + 1);
        toast({
          title: "Tiempo de conexión agotado",
          description: "La conexión con Supabase ha excedido el tiempo de espera. Verifica tu conexión a internet o la configuración de Supabase.",
          variant: "destructive"
        });
      }
    }, 10000);
    
    try {
      console.log("Intentando conectar a Supabase...");
      console.log("Supabase URL:", SUPABASE_CONFIG.url);
      
      // Verificación de ping básica para comprobar la latencia de red
      const startTime = Date.now();
      
      // Primero verificamos la autenticación
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error("Error de conexión de autenticación:", authError);
        throw authError;
      }
      
      console.log("Verificación de autenticación exitosa:", authData);
      
      // Luego verificamos el acceso a datos con una consulta liviana
      const { data, error } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
      
      // Calcular latencia
      const latency = Date.now() - startTime;
      console.log(`Latencia de Supabase: ${latency}ms`);
      
      // Solo procesamos si es el intento más reciente
      if (currentAttempt === testAttemptRef.current) {
        if (error) {
          console.error("Error de conexión de datos:", error);
          // Si la autenticación funcionó pero hay error en datos, puede ser un problema de permisos
          setIsConnected(true);
          setErrorMessage("La autenticación funciona pero el acceso a datos puede estar limitado: " + error.message);
          toast({
            title: "Conexión parcial",
            description: "La autenticación funciona pero el acceso a datos está limitado. Verifica los permisos.",
            variant: "default"
          });
        } else {
          console.log("Conexión con Supabase exitosa! Datos:", data);
          setIsConnected(true);
          setConsecutiveFailures(0);
          toast({
            title: "Conexión exitosa",
            description: `La aplicación está correctamente conectada a Supabase. Latencia: ${latency}ms`,
          });
        }
        
        // Clear timeout since we got a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
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
