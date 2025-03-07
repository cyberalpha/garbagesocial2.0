
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
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

export const useAuthActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setPendingVerification: (pending: boolean) => void
) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSessionChange = async (session: any) => {
    try {
      console.log("Session change detected:", session);
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

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      
      if (response.error) {
        console.error('Error al iniciar sesión:', response.error);
        toast({
          title: t('general.error'),
          description: response.error.message || "Error al iniciar sesión",
          variant: "destructive"
        });
      } else {
        toast({
          title: t('general.success'),
          description: `${t('auth.login')} exitoso`,
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Error inesperado al iniciar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
      throw error;
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

  return {
    handleSessionChange,
    login,
    register,
    logout
  };
};
