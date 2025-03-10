
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const useSocialMediaLogin = (
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google'
        });
        
        if (error) {
          throw error;
        }
      } else {
        toast({
          title: t('general.error'),
          description: `Inicio de sesión con ${provider} no implementado todavía`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error(`Error inesperado al iniciar sesión con ${provider}:`, error);
      toast({
        title: t('general.error'),
        description: error.message || `Ocurrió un error al iniciar sesión con ${provider}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithSocialMedia };
};
