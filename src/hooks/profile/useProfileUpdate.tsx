
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
      
      // Ensure the user ID is a valid UUID
      if (!currentUser.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentUser.id)) {
        console.error('ID de usuario inválido:', currentUser.id);
        toast({
          title: t('general.error'),
          description: "ID de usuario inválido",
          variant: "destructive"
        });
        return null;
      }
      
      // Verificar si el perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error al verificar perfil:', checkError);
      }
      
      // Crear o actualizar perfil usando upsert para mayor seguridad
      const profileData = {
        id: currentUser.id,
        name: userData.name || currentUser.name,
        email: userData.email || currentUser.email,
        is_organization: userData.isOrganization !== undefined ? userData.isOrganization : currentUser.isOrganization,
        profile_image: userData.profileImage || currentUser.profileImage,
        average_rating: currentUser.averageRating || 0
      };
      
      console.log('Enviando datos de perfil a Supabase:', profileData);
      
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          returning: 'minimal'
        });
        
      if (upsertError) {
        console.error('Error al guardar perfil:', upsertError);
        toast({
          title: t('general.error'),
          description: upsertError.message || "Error al actualizar perfil",
          variant: "destructive"
        });
        return null;
      }
      
      console.log('Perfil guardado con éxito');
      
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
