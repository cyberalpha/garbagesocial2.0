
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfileActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  logout: () => Promise<void>
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

  const handleResendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      // Enviar email de verificación a través de Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('general.success'),
        description: "Se ha enviado un nuevo correo de verificación"
      });
    } catch (error: any) {
      console.error('Error inesperado al reenviar correo de verificación:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error al reenviar el correo de verificación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      
      if (error) {
        console.error('Error verificando email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error inesperado verificando email:', error);
      return false;
    }
  };

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

  return {
    updateProfile,
    deleteProfile,
    verifyEmail,
    loginWithSocialMedia,
    handleResendVerificationEmail
  };
};
