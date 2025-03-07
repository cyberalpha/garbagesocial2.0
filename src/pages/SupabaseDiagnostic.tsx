
import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPABASE_CONFIG } from '@/integrations/supabase/client';

const SupabaseDiagnostic = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Diagnóstico de Conexión Supabase</h1>
      
      <div className="grid gap-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Supabase</CardTitle>
            <CardDescription>
              Detalles de la configuración actual de Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">URL de Supabase:</h3>
                <div className="bg-muted p-2 rounded text-sm break-all font-mono">
                  {SUPABASE_CONFIG.url}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">API Key:</h3>
                <div className="bg-muted p-2 rounded text-sm font-mono">
                  {SUPABASE_CONFIG.key.substring(0, 8)}...{SUPABASE_CONFIG.key.substring(SUPABASE_CONFIG.key.length - 8)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (Mostrada parcialmente por seguridad)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <SupabaseConnectionTest />
        
        <Card>
          <CardHeader>
            <CardTitle>Solución de Problemas</CardTitle>
            <CardDescription>
              Pasos para solucionar problemas comunes de conexión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Verificar el estado del proyecto Supabase</h3>
                <p className="text-sm text-muted-foreground">
                  Accede al dashboard de Supabase y verifica que tu proyecto esté activo y no en pausa.
                </p>
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline mt-1 inline-block"
                >
                  Ir al Dashboard de Supabase →
                </a>
              </div>
              
              <div>
                <h3 className="font-medium">2. Verificar credenciales</h3>
                <p className="text-sm text-muted-foreground">
                  Asegúrate de que la URL y la clave API de Supabase son correctas. Puedes 
                  encontrarlas en la configuración de tu proyecto en el dashboard de Supabase.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">3. Comprobar la tabla 'profiles'</h3>
                <p className="text-sm text-muted-foreground">
                  El test de conexión intenta acceder a la tabla 'profiles'. Asegúrate de que
                  esta tabla exista en tu base de datos Supabase y tenga las políticas de seguridad apropiadas.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">4. Problemas de red</h3>
                <p className="text-sm text-muted-foreground">
                  Si hay problemas de firewall o proxy, asegúrate de que se permiten conexiones a *.supabase.co y *.supabase.in
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">5. Errores de CORS (para desarrollo local)</h3>
                <p className="text-sm text-muted-foreground">
                  Si estás en desarrollo local, verifica la configuración de CORS en tu proyecto Supabase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;
