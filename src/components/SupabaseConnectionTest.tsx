
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
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const testConnection = async () => {
    // Limpiar cualquier timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLoading(true);
    setIsConnected(null);
    setErrorMessage(null);
    
    // Configurar un timeout de 10 segundos
    timeoutRef.current = setTimeout(() => {
      console.log("Conexión a Supabase timeout alcanzado");
      setIsLoading(false);
      setIsConnected(false);
      setErrorMessage("Tiempo de espera excedido. Verifica la URL y la clave de Supabase.");
      toast({
        title: "Tiempo de espera excedido",
        description: "La conexión a Supabase está tomando demasiado tiempo. Verifica tu conexión a internet o la configuración de Supabase.",
        variant: "destructive"
      });
    }, 10000);
    
    try {
      // Probar con autenticación primero que es más ligera
      console.log("Intentando conectar a Supabase...");
      console.log("URL de Supabase:", SUPABASE_CONFIG.url);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      // Si getSession funciona, intentar una consulta a la base de datos
      const { data, error } = await supabase.from('profiles').select('count').limit(1).single();
      
      // Limpiar el timeout ya que obtuvimos una respuesta
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (error && error.code !== 'PGRST116') { // Ignora error de datos no encontrados
        console.warn("Error de conexión a la tabla profiles:", error);
        // Si hay error en la tabla pero la autenticación funciona, es un problema de permisos o tabla no existe
        setIsConnected(true);
        toast({
          title: "Conexión parcial",
          description: "La autenticación funciona pero hay problemas con el acceso a las tablas: " + error.message,
        });
      } else {
        console.log("Conexión exitosa a Supabase:", data || "No hay datos en la tabla profiles");
        setIsConnected(true);
        toast({
          title: "Conexión exitosa",
          description: "La aplicación está conectada a Supabase correctamente",
        });
      }
    } catch (error: any) {
      // Limpiar el timeout ya que obtuvimos una respuesta (error)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.error("Error inesperado:", error);
      setIsConnected(false);
      setErrorMessage(error.message || "Error desconocido");
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al intentar conectar con Supabase: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Probar la conexión automáticamente al cargar el componente
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Estado de la conexión a Supabase</CardTitle>
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
                <li>Verifica la URL y la clave de Supabase en el cliente</li>
                <li>Comprueba si tu proyecto de Supabase está activo</li>
                <li>Revisa si hay problemas de CORS o bloqueos de red</li>
                <li>La tabla 'profiles' existe y tiene permisos correctos</li>
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
            'Verificar conexión de nuevo'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConnectionTest;
