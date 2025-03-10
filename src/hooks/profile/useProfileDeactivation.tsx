
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

  const deleteProfile = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        toast({
          title: t('general.error'),
          description: "Debes iniciar sesión para desactivar tu perfil",
          variant: "destructive"
        });
        return false;
      }

      console.log('Intentando desactivar perfil en Supabase:', currentUser.id);
      
      // En lugar de usar un campo "active", marcamos el perfil como desactivado de otra manera
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
        return false;
      }
      
      // Cerrar sesión después de desactivar el perfil
      await logout();
      
      toast({
        title: t('general.success'),
        description: "Tu perfil ha sido desactivado. Puedes reactivarlo registrándote nuevamente con el mismo correo electrónico."
      });
      
      return true;
    } catch (error: any) {
      console.error('Error inesperado al desactivar perfil:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante la desactivación",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteProfile };
};
