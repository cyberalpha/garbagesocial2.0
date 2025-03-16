
import React, { useEffect } from 'react';
import { setOfflineMode } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { cleanupAuthSession } from '@/utils/authCleanup';

/**
 * Componente que garantiza la estabilidad de la aplicación
 * Se monta una sola vez y se encarga de bloquear reconexiones y estabilizar la interfaz
 */
const StabilityManager: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("StabilityManager: Inicializando control de estabilidad");
    
    // Forzar modo offline permanente al iniciar
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
    
    // Registrar los eventos para detectar cierres de sesión incorrectos
    const handleLogoutCheck = () => {
      if (!currentUser && !isLoading) {
        console.log("StabilityManager: Detectada posible sesión cerrada incorrectamente");
        cleanupAuthSession();
        navigate('/', { replace: true });
      }
    };
    
    // Verificar periódicamente si hay una sesión inconsistente
    const checkSessionInterval = setInterval(handleLogoutCheck, 10000);
    
    // Limpiar sesiones y caché al inicio
    cleanupAuthSession();
    
    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('unload', cleanupAuthSession);
    
    return () => {
      clearInterval(forceOfflineInterval);
      clearInterval(checkSessionInterval);
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('unload', cleanupAuthSession);
    };
  }, [currentUser, isLoading, navigate]);
  
  // Este componente no renderiza nada visible
  return null;
};

export default StabilityManager;
