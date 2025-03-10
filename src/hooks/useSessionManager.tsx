
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFromStorage } from '@/services/localStorage';

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
    // Configurar el listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        try {
          await handleSessionChange(session);
        } catch (error) {
          console.error('Error en handleSessionChange:', error);
          // Si hay un error, mantenemos el usuario almacenado en localStorage
          setIsLoading(false);
        }
      }
    );

    // Verificar la sesión actual al cargar
    const checkCurrentSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          // Si hay un error, usamos el usuario del localStorage
          const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
          if (savedUser) {
            console.log('Usando usuario de respaldo desde localStorage:', savedUser);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
          return;
        }
        
        if (!session) {
          // Si no hay sesión pero hay usuario en localStorage, lo mantenemos
          const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
          if (savedUser) {
            console.log('No hay sesión activa pero se encontró usuario en localStorage');
          }
          setIsLoading(false);
          return;
        }

        try {
          await handleSessionChange(session);
        } catch (error) {
          console.error('Error en handleSessionChange durante inicialización:', error);
          // Si hay un error, mantenemos el usuario almacenado en localStorage
          const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
          if (savedUser) {
            console.log('Usando usuario de respaldo desde localStorage debido a error');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking current session:', error);
        // En caso de error, usamos el usuario del localStorage
        const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
        if (savedUser) {
          console.log('Usando usuario de respaldo desde localStorage debido a error general');
        }
        setIsLoading(false);
      }
    };

    checkCurrentSession();

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionChange, setIsLoading]);
};
