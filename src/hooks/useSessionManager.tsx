
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSessionManagerProps {
  handleSessionChange: (session: any) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
}

export const useSessionManager = ({ 
  handleSessionChange, 
  setIsLoading 
}: UseSessionManagerProps) => {
  
  useEffect(() => {
    // Configurar el listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        await handleSessionChange(session);
      }
    );

    // Verificar la sesión actual al cargar
    const checkCurrentSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        await handleSessionChange(session);
      } catch (error) {
        console.error('Error checking current session:', error);
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
