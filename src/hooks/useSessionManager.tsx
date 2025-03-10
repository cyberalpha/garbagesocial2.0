
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFromStorage } from '@/services/localStorage';
import { syncProfilesWithLocalStorage } from '@/utils/supabaseConnectionUtils';

interface UseSessionManagerProps {
  handleSessionChange: (session: any) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
}

const AUTH_USER_STORAGE_KEY = 'auth_user_data';

export const useSessionManager = ({ 
  handleSessionChange, 
  setIsLoading 
}: UseSessionManagerProps) => {
  
  useEffect(() => {
    // Iniciar en estado de carga
    setIsLoading(true);
    
    // Configurar el listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Estado de autenticación cambiado:', event, session);
        
        try {
          // Después de un inicio de sesión exitoso, sincronizar perfiles
          if (event === 'SIGNED_IN' && session) {
            await syncProfilesWithLocalStorage();
          }
          
          await handleSessionChange(session);
        } catch (error) {
          console.error('Error en handleSessionChange:', error);
          setIsLoading(false);
        }
      }
    );

    // Verificar la sesión actual al cargar
    const checkCurrentSession = async () => {
      try {
        console.log('Verificando sesión actual...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          setIsLoading(false);
          return;
        }
        
        if (!session) {
          console.log('No hay sesión activa');
          setIsLoading(false);
          return;
        }

        // Sincronizar perfiles si tenemos una sesión válida
        try {
          await syncProfilesWithLocalStorage();
        } catch (syncError) {
          console.error('Error sincronizando perfiles:', syncError);
        }

        try {
          await handleSessionChange(session);
        } catch (error) {
          console.error('Error en handleSessionChange durante inicialización:', error);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error verificando sesión actual:', error);
        setIsLoading(false);
      }
    };

    // Verificar sesión inmediatamente
    checkCurrentSession();

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionChange, setIsLoading]);
};
