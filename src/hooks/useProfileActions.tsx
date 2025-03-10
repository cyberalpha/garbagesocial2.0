
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { getFromStorage, saveToStorage } from '@/services/localStorage';

const AUTH_USER_STORAGE_KEY = 'auth_user_data';

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

      // Actualizar el usuario en memoria
      const updatedUser = {
        ...currentUser,
        ...userData,
      };

      // En una aplicación real, aquí actualizaríamos el perfil en la base de datos
      
      setCurrentUser(updatedUser);
      saveToStorage(AUTH_USER_STORAGE_KEY, updatedUser, { expiration: 7 * 24 * 60 * 60 * 1000 });
      
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

      // En una aplicación real, aquí desactivaríamos el perfil en la base de datos
      
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
      // En una aplicación real, aquí enviaríamos el correo de verificación
      
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
    // En una aplicación real, aquí verificaríamos el token de correo electrónico
    return true;
  };

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      // En una aplicación real, aquí manejaríamos el inicio de sesión con redes sociales
      toast({
        title: t('general.error'),
        description: `Inicio de sesión con ${provider} no implementado en el modo desconectado`,
        variant: "destructive"
      });
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
