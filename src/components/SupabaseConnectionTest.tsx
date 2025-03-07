
import { useEffect } from 'react';
import { SUPABASE_CONFIG } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ConnectionStatusDisplay from './supabase-connection/ConnectionStatusDisplay';
import ConnectionTestButton from './supabase-connection/ConnectionTestButton';
import { useSupabaseConnectionTest } from '@/hooks/useSupabaseConnectionTest';

const SupabaseConnectionTest = () => {
  const { 
    isConnected, 
    isLoading, 
    errorMessage, 
    testConnection 
  } = useSupabaseConnectionTest();

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
        <ConnectionStatusDisplay 
          isConnected={isConnected} 
          isLoading={isLoading} 
          errorMessage={errorMessage} 
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <ConnectionTestButton 
          onClick={testConnection} 
          isLoading={isLoading}
        />
      </CardFooter>
    </Card>
  );
};

export default SupabaseConnectionTest;
