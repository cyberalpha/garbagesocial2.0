
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfileUpdate = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        toast({
          title: t('general.error'),
          description: "Debes iniciar sesión para actualizar tu perfil",
          variant: "destructive"
        });
        return null;
      }

      console.log('Intentando actualizar perfil en Supabase:', currentUser.id, userData);
      
      // Update the user in Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          name: userData.name || currentUser.name,
          email: userData.email || currentUser.email,
          is_organization: userData.isOrganization !== undefined ? userData.isOrganization : currentUser.isOrganization,
          profile_image: userData.profileImage || currentUser.profileImage,
          average_rating: currentUser.averageRating || 0
        }, {
          onConflict: 'id'
        })
        .select();
      
      if (supabaseError) {
        console.error('Error al actualizar perfil en Supabase:', supabaseError);
        toast({
          title: t('general.error'),
          description: supabaseError.message || "Error actualizando perfil en la base de datos",
          variant: "destructive"
        });
        return null;
      }
      
      console.log('Perfil actualizado en Supabase:', supabaseData);
      
      // Actualizar el usuario en memoria
      const updatedUser = {
        ...currentUser,
        ...userData,
      };
      
      setCurrentUser(updatedUser);
      
      toast({
        title: t('general.success'),
        description: "Perfil actualizado correctamente"
      });
      
      return updatedUser;
    } catch (error: any) {
      console.error('Error inesperado al actualizar perfil:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante la actualización",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile };
};
