
import { useState, useEffect } from 'react';
import { offlineMode, testConnection } from '@/integrations/supabase/client';

export interface ConnectionTestResult {
  success: boolean;
  error: string | null;
  latency?: number;
  supabaseVersion?: string;
  message?: string;
}

export const useSupabaseConnectionTest = () => {
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  
  // Verificar el estado offline
  const isOffline = offlineMode();
  
  useEffect(() => {
    if (isOffline) {
      // Si está en modo offline, establecer un resultado predeterminado
      setTestResult({
        success: false,
        error: "Modo offline activado. No se puede conectar a Supabase.",
        message: "La aplicación está en modo offline"
      });
    }
  }, [isOffline]);
  
  const testSupabaseConnection = async () => {
    if (isOffline) {
      // Si está en modo offline, no intentar la conexión
      setTestResult({
        success: false,
        error: "Modo offline activado. No se puede conectar a Supabase.",
        message: "La aplicación está en modo offline"
      });
      setShowResult(true);
      return;
    }
    
    setIsTestingConnection(true);
    setShowResult(false);
    
    try {
      // Prueba la conexión utilizando la función del cliente de Supabase
      const result = await testConnection();
      
      // Adaptamos la respuesta al formato esperado por nuestro hook
      const testResult: ConnectionTestResult = {
        success: result.success,
        error: result.error || null,
        latency: 0, // Valor por defecto ya que no tenemos esta info
        supabaseVersion: 'Unknown' // Valor por defecto ya que no tenemos esta info
      };
      
      setTestResult(testResult);
      setShowResult(true);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error?.message || "Error desconocido al probar la conexión",
        message: error?.message || "Error desconocido"
      });
      setShowResult(true);
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  return {
    isTestingConnection,
    testResult,
    showResult,
    setShowResult,
    testSupabaseConnection,
    isOffline
  };
};
