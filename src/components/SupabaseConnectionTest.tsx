
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsLoading(true);
    setIsConnected(null);
    
    try {
      // Un simple ping a Supabase
      const { data, error } = await supabase.from('pg_stat_statements').select('*').limit(1);
      
      // Si hay un error de permisos, eso significa que la conexión funcionó,
      // pero el usuario no tiene permiso para ver esa tabla (lo cual es normal)
      if (error && error.code === '42501') {
        setIsConnected(true);
        toast({
          title: "Conexión exitosa",
          description: "La aplicación está conectada a Supabase correctamente",
        });
      } else if (error) {
        console.error("Error de conexión:", error);
        setIsConnected(false);
        toast({
          title: "Error de conexión",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setIsConnected(true);
        toast({
          title: "Conexión exitosa",
          description: "La aplicación está conectada a Supabase correctamente",
        });
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setIsConnected(false);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al intentar conectar con Supabase",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
