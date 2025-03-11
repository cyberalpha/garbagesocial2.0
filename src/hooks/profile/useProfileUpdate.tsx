
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
      
      if (!currentUser.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentUser.id)) {
        console.error('ID de usuario inválido:', currentUser.id);
        toast({
          title: t('general.error'),
          description: "ID de usuario inválido",
          variant: "destructive"
        });
        return null;
      }
      
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error al verificar perfil:', checkError);
      }
      
      const profileData = {
        id: currentUser.id,
        name: userData.name || currentUser.name,
        email: userData.email || currentUser.email,
        is_organization: userData.isOrganization !== undefined ? userData.isOrganization : currentUser.isOrganization,
        profile_image: userData.profileImage || currentUser.profileImage,
        average_rating: currentUser.averageRating || 0
      };
      
      console.log('Enviando datos de perfil a Supabase:', profileData);
      
      // Primero intentamos con upsert
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (upsertError) {
        console.error('Error con upsert, intentando con insert:', upsertError);
        // Si falla upsert, intentamos con insert
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
          
        if (insertError) {
          console.error('Error al guardar perfil:', insertError);
          toast({
            title: t('general.error'),
            description: insertError.message || "Error al actualizar perfil",
            variant: "destructive"
          });
          return null;
        }
      }
      
      console.log('Perfil guardado con éxito');
      
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
