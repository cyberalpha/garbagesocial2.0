
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionManagerProps {
  handleSessionChange: (event: any, session: any) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useSessionManager = ({ handleSessionChange, setIsLoading }: SessionManagerProps) => {
  useEffect(() => {
    console.log('Configurando observador de sesión');
    
    // Initial session check
    const checkSession = async () => {
      console.log('Verificando sesión actual...');
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('Sesión existente encontrada');
        handleSessionChange('SIGNED_IN', data.session);
      } else {
        console.log('No hay sesión activa');
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Cambio en el estado de autenticación:', event);
      handleSessionChange(event, session);
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionChange, setIsLoading]);
};
