
import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_CONFIG } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SupabaseConnectionTest = () => {
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
    
    // Set a timeout of 10 seconds (reduced from 15)
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

  // Test connection automatically when component loads
  useEffect(() => {
    testConnection();
    
    // También verificamos cada vez que la ventana recupere el foco
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoading) {
        console.log("Ventana visible de nuevo, verificando conexión...");
        testConnection();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Estado de Conexión con Supabase</CardTitle>
        <CardDescription>
          Verifica si la aplicación puede conectarse a la base de datos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p>Verificando conexión...</p>
          </div>
        ) : isConnected === null ? (
          <p>Esperando verificación...</p>
        ) : isConnected ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle className="h-12 w-12" />
            <p className="text-lg font-medium">Conectado a Supabase</p>
            {errorMessage && (
              <p className="text-amber-600 text-sm text-center mt-2 max-w-xs">{errorMessage}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-red-600">
            <XCircle className="h-12 w-12" />
            <p className="text-lg font-medium">No se pudo conectar a Supabase</p>
            {errorMessage && (
              <p className="text-sm text-center mt-2 max-w-xs">{errorMessage}</p>
            )}
            <div className="mt-4 p-4 bg-red-50 rounded-md text-sm">
              <h4 className="font-medium mb-2">Posibles soluciones:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verificar tu conexión a internet</li>
                <li>Asegurar que tu proyecto de Supabase esté activo</li>
                <li>Limpiar el caché y cookies del navegador</li>
                <li>Verificar problemas de CORS (para desarrollo local)</li>
                <li>Confirmar que la URL y clave de Supabase sean correctas</li>
                <li>Asegurar que la tabla 'profiles' exista en Supabase</li>
                <li>Verificar que el usuario esté autenticado (si es necesario)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Probar Conexión de Nuevo'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConnectionTest;
