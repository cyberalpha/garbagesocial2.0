
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
      
      // Preparamos los datos para Supabase, asegurándonos de transformar los campos correctamente
      const profileData = {
        id: currentUser.id,
        name: userData.name || currentUser.name,
        email: userData.email || currentUser.email,
        is_organization: userData.isOrganization !== undefined ? userData.isOrganization : currentUser.isOrganization,
        profile_image: userData.profileImage || currentUser.profileImage,
        active: true // Aseguramos que el perfil esté activo
      };
      
      console.log('Enviando datos de perfil a Supabase:', profileData);
      
      // Primero verificamos si el perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error al verificar perfil:', checkError);
        throw new Error(checkError.message);
      }
      
      let result;
      
      if (existingProfile) {
        // Si existe, actualizamos
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', currentUser.id);
      } else {
        // Si no existe, insertamos
        result = await supabase
          .from('profiles')
          .insert(profileData);
      }
      
      if (result.error) {
        console.error('Error al guardar perfil:', result.error);
        throw new Error(result.error.message);
      }
      
      console.log('Perfil guardado con éxito');
      
      // Actualizamos el usuario en el estado local
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
      
      // Capturamos y mostramos los mensajes de error
      const errorMessage = error.message || "Ocurrió un error durante la actualización";
      console.error('Mensaje de error completo:', errorMessage);
      
      toast({
        title: t('general.error'),
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile };
};
