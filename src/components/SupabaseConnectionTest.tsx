
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SUPABASE_CONFIG, supabase } from '@/integrations/supabase/client';
import { useSupabaseConnectionTest } from '@/hooks/useSupabaseConnectionTest';
import ConnectionStatusDisplay from './supabase-connection/ConnectionStatusDisplay';
import StatusIcon from './supabase-connection/StatusIcon';
import OfflineModeToggle from './OfflineModeToggle';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const SupabaseConnectionTest = () => {
  const { 
    isConnected, 
    isLoading, 
    errorMessage, 
    testConnection,
    connectionDetails
  } = useSupabaseConnectionTest();
  
  const { status, isOfflineMode } = useSupabaseConnection();

  useEffect(() => {
    // Test connection on mount
    testConnection();
  }, [testConnection]);

  const handleForceTest = () => {
    console.log("Forzando verificación de conexión...");
    testConnection(true); // Pasar true para indicar que es una prueba forzada
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conexión a Supabase</CardTitle>
          <CardDescription>
            URL: {SUPABASE_CONFIG.url}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
            <OfflineModeToggle />
          </div>
          
          {!isOfflineMode && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Estado:</span>
                  <StatusIcon status={isConnected ? 'connected' : isLoading ? 'connecting' : 'disconnected'} />
                  <span className="text-sm">
                    {isConnected ? 'Conectado' : isLoading ? 'Verificando...' : 'Desconectado'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleForceTest} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Probar conexión'}
                </Button>
              </div>
              
              {connectionDetails && isConnected && (
                <div className="text-xs text-muted-foreground px-2">
                  <p>Latencia: {connectionDetails.latency}ms</p>
                  <p>Última verificación: {connectionDetails.timestamp ? new Date(connectionDetails.timestamp).toLocaleTimeString() : 'N/A'}</p>
                  {connectionDetails.supabaseVersion && <p>Versión: {connectionDetails.supabaseVersion}</p>}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4">
            <ConnectionStatusDisplay 
              isConnected={isConnected} 
              isLoading={isLoading} 
              errorMessage={errorMessage} 
              isOfflineMode={isOfflineMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagrama de conexión</CardTitle>
          <CardDescription>
            Cómo funciona la conexión a Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>1. La aplicación intenta conectarse a <strong>{SUPABASE_CONFIG.url}</strong> usando la clave pública.</p>
            <p>2. Si la conexión es exitosa, se utilizan las funciones de autenticación de Supabase.</p>
            <p>3. Si la conexión falla, se activa automáticamente el modo offline.</p>
            <p>4. En modo offline, se utilizan usuarios demo almacenados localmente.</p>
            <p className="font-medium">Estado actual: {isOfflineMode ? 'Modo offline activo' : isConnected ? 'Conectado a Supabase' : 'Sin conexión'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseConnectionTest;
