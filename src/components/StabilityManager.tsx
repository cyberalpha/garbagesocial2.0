
import React, { useEffect } from 'react';
import { setOfflineMode } from '@/integrations/supabase/client';

/**
 * Componente que garantiza la estabilidad de la aplicación
 * Se monta una sola vez y se encarga de bloquear reconexiones y estabilizar la interfaz
 */
const StabilityManager: React.FC = () => {
  useEffect(() => {
    console.log("StabilityManager: Inicializando control de estabilidad");
    
    // Forzar modo offline permanente
    setOfflineMode(true);
    
    // Prevenir parpadeos por reconexiones automáticas
    const forceOfflineInterval = setInterval(() => {
      setOfflineMode(true);
    }, 5000);
    
    // Interceptar eventos de red para evitar reconexiones
    const handleOnlineEvent = () => {
      console.log("StabilityManager: Interceptando evento 'online'");
      setOfflineMode(true); // Mantener modo offline aunque el navegador detecte conexión
    };
    
    window.addEventListener('online', handleOnlineEvent);
    
    return () => {
      clearInterval(forceOfflineInterval);
      window.removeEventListener('online', handleOnlineEvent);
    };
  }, []);
  
  // Este componente no renderiza nada visible
  return null;
};

export default StabilityManager;
