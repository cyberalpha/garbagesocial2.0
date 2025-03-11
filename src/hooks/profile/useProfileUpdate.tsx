
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
      
      // Si el perfil no existe, crearlo
      if (!existingProfile) {
        console.log('Perfil no encontrado, creando nuevo perfil');
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            name: userData.name || currentUser.name,
            email: userData.email || currentUser.email,
            is_organization: userData.isOrganization !== undefined ? userData.isOrganization : currentUser.isOrganization,
            profile_image: userData.profileImage || currentUser.profileImage,
            average_rating: currentUser.averageRating || 0
          })
          .select();
          
        if (insertError) {
          console.error('Error al crear perfil:', insertError);
          toast({
            title: t('general.error'),
            description: insertError.message || "Error al crear perfil",
            variant: "destructive"
          });
          return null;
        }
        
        console.log('Perfil creado con éxito:', insertData);
      } else {
        // Actualizar el perfil existente
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            name: userData.name || currentUser.name,
            email: userData.email || currentUser.email,
            is_organization: userData.isOrganization !== undefined ? userData.isOrganization : currentUser.isOrganization,
            profile_image: userData.profileImage || currentUser.profileImage,
            average_rating: currentUser.averageRating || 0
          })
          .eq('id', currentUser.id)
          .select();
          
        if (updateError) {
          console.error('Error al actualizar perfil:', updateError);
          toast({
            title: t('general.error'),
            description: updateError.message || "Error al actualizar perfil",
            variant: "destructive"
          });
          return null;
        }
        
        console.log('Perfil actualizado con éxito:', updateData);
      }
      
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
