
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  updateUserProfile, 
  updateUserEmail,
  deactivateProfile,
  resendVerificationEmail,
  loginWithProvider,
  getUserProfile
} from '@/services/authService';
import { mapProfileToUser } from '@/utils/userUtils';

export const useAuthProvider = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Función para manejar el cambio de sesión
  const handleSessionChange = async (session: any) => {
    try {
      if (session?.user) {
        const { data: profile, error } = await getUserProfile(session.user.id);

        if (error) {
          console.error('Error fetching profile:', error);
          setCurrentUser(null);
        } else if (profile) {
          const userProfile = mapProfileToUser(profile);
          setCurrentUser(userProfile);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error in session change:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de autenticación
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await loginUser(email, password);

      if (error) {
        console.error('Error al iniciar sesión:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al iniciar sesión",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('general.success'),
        description: `${t('auth.login')} ${data.user?.email}`,
      });
    } catch (error: any) {
      console.error('Error inesperado al iniciar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await registerUser(userData);

      if (error) {
        console.error('Error al registrar usuario:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al registrar usuario",
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: t('general.success'),
        description: "Registro exitoso. ¡Bienvenido!",
      });

      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          name: userData.name || '',
          email: userData.email || '',
          isOrganization: userData.isOrganization || false,
          averageRating: 0,
          profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
          emailVerified: true,
          active: true
        };
        
        return newUser;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error inesperado al registrar usuario:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante el registro",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await logoutUser();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al cerrar sesión",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error: any) {
      console.error('Error inesperado al cerrar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error al cerrar la sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      // Actualizar el perfil en la tabla profiles
      const { data, error } = await updateUserProfile(currentUser.id, userData);

      if (error) {
        console.error('Error al actualizar perfil:', error);
        toast({
          title: t('general.error'),
          description: error.message || "No se pudo actualizar el perfil",
          variant: "destructive"
        });
        return null;
      }

      // Si se cambió el email, actualizar también en Auth
      if (userData.email && userData.email !== currentUser.email) {
        const { error: updateAuthError } = await updateUserEmail(userData.email);

        if (updateAuthError) {
          console.error('Error al actualizar email en Auth:', updateAuthError);
          toast({
            title: t('general.error'),
            description: updateAuthError.message || "No se pudo actualizar el email",
            variant: "destructive"
          });
          return null;
        }
      }

      // Convertir el perfil actualizado al formato User
      const updatedUser = mapProfileToUser(data);

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

      // Desactivar el perfil en la tabla profiles (soft delete)
      const { error } = await deactivateProfile(currentUser.id);

      if (error) {
        console.error('Error al desactivar perfil:', error);
        toast({
          title: t('general.error'),
          description: error.message || "No se pudo desactivar el perfil",
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
      const { error } = await resendVerificationEmail(email);
      
      if (error) {
        console.error('Error al reenviar email de verificación:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al reenviar email de verificación",
          variant: "destructive"
        });
        return;
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
    // Esta función no se utiliza directamente con Supabase
    // ya que la verificación se maneja a través de URLs específicas
    return true;
  };

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      let { error } = await loginWithProvider(provider);
      
      if (error) {
        console.error(`Error al iniciar sesión con ${provider}:`, error);
        toast({
          title: t('general.error'),
          description: error.message || `Error al iniciar sesión con ${provider}`,
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
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification,
    handleSessionChange,
    login,
    register,
    logout,
    updateProfile,
    deleteProfile,
    verifyEmail,
    loginWithSocialMedia,
    handleResendVerificationEmail
  };
};
