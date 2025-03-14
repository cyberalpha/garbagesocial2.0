
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfileDeactivation = (
  currentUser: User | null,
  setIsLoading: (loading: boolean) => void,
  logout: () => Promise<void>
) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const deleteProfile = async (): Promise<void> => {
    if (!currentUser) {
      toast({
        title: t('general.error'),
        description: "Debes iniciar sesión para desactivar tu perfil",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Intentando desactivar perfil en Supabase:', currentUser.id);
      
      // En lugar de borrar el perfil, lo marcamos como desactivado
      // Prefijamos el nombre con "DELETED_" para indicar que está desactivado
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({ 
          name: `DELETED_${currentUser.name}`,
          profile_image: null 
        })
        .eq('id', currentUser.id);
      
      if (supabaseError) {
        console.error('Error al desactivar perfil en Supabase:', supabaseError);
        toast({
          title: t('general.error'),
          description: supabaseError.message || "Error al desactivar perfil en la base de datos",
          variant: "destructive"
        });
        return;
      }
      
      // Cerrar sesión después de desactivar el perfil
      await logout();
      
      toast({
        title: t('general.success'),
        description: "Tu perfil ha sido desactivado. Puedes reactivarlo registrándote nuevamente con el mismo correo electrónico."
      });
    } catch (error: any) {
      console.error('Error inesperado al desactivar perfil:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante la desactivación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteProfile };
};
