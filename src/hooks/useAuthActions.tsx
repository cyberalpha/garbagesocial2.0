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
  getUserProfile,
  getCurrentSession
} from '@/services/authService';
import { mapProfileToUser } from '@/utils/userUtils';
import { saveToStorage, getFromStorage, removeItem } from '@/services/localStorage';
import { syncProfilesWithLocalStorage } from '@/utils/supabaseConnectionUtils';

const AUTH_USER_STORAGE_KEY = 'auth_user_data';
const AUTH_SESSION_STORAGE_KEY = 'auth_session_data';

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
      setIsLoading(true);
      
      if (session?.user) {
        // Guardar la sesión en localStorage para recuperarla en caso de error
        saveToStorage(AUTH_SESSION_STORAGE_KEY, session, { expiration: 7 * 24 * 60 * 60 * 1000 });
        
        // Intentar obtener el perfil del usuario
        const { data: profile, error } = await getUserProfile(session.user.id);

        if (error) {
          console.error('Error fetching profile:', error);
          // Si hay error pero tenemos un usuario en localStorage, lo mantenemos
          const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
          if (savedUser) {
            console.log('Error fetching profile, using saved user from localStorage');
            setCurrentUser(savedUser);
          } else {
            // Si no hay perfil ni usuario guardado, crear uno básico desde los metadatos
            createUserFromSession(session);
          }
        } else if (profile) {
          // Si tenemos perfil, lo mapeamos y lo guardamos
          const userProfile = mapProfileToUser(profile);
          console.log('Usuario mapeado desde perfil:', userProfile);
          setCurrentUser(userProfile);
          saveToStorage(AUTH_USER_STORAGE_KEY, userProfile, { expiration: 7 * 24 * 60 * 60 * 1000 });
        } else {
          // Si no hay perfil, crear uno básico desde los metadatos
          console.log('No se encontró perfil para el usuario:', session.user.id);
          createUserFromSession(session);
        }
        
        // Sincronizar perfiles después de actualizar el usuario
        try {
          await syncProfilesWithLocalStorage();
        } catch (syncError) {
          console.error('Error synchronizing profiles after session change:', syncError);
        }
      } else {
        // Verificar si tenemos usuario en localStorage antes de limpiarlo
        const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
        const savedSession = getFromStorage(AUTH_SESSION_STORAGE_KEY, null);
        
        if (!savedSession) {
          // Si no hay sesión almacenada, limpiar el usuario
          setCurrentUser(null);
          removeItem(AUTH_USER_STORAGE_KEY);
        } else if (savedUser && !session) {
          // Si hay usuario almacenado pero no hay sesión actual, mantener el usuario
          console.log('Manteniendo usuario de localStorage a pesar de no tener sesión activa');
          setCurrentUser(savedUser);
        }
      }
    } catch (error) {
      console.error('Error in session change:', error);
      // Si hay error pero tenemos un usuario en localStorage, lo mantenemos
      const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
      if (savedUser) {
        console.log('Error in session change, using saved user from localStorage');
        setCurrentUser(savedUser);
      } else {
        setCurrentUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createUserFromSession = (session: any) => {
    const userProfile: User = {
      id: session.user.id,
      name: session.user.user_metadata?.name || 'Usuario',
      email: session.user.email || '',
      isOrganization: session.user.user_metadata?.isOrganization || false,
      averageRating: 0,
      profileImage: session.user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.user_metadata?.name || 'Usuario'}`,
      emailVerified: true,
      active: true
    };
    console.log('Creando usuario desde metadatos:', userProfile);
    setCurrentUser(userProfile);
    saveToStorage(AUTH_USER_STORAGE_KEY, userProfile, { expiration: 7 * 24 * 60 * 60 * 1000 });
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt with email:', email);
      setIsLoading(true);
      
      const response = await loginUser(email, password);
      
      if (response.error) {
        console.error('Error al iniciar sesión:', response.error);
        toast({
          title: t('general.error'),
          description: response.error.message || "Error al iniciar sesión",
          variant: "destructive"
        });
      } else if (response.data && response.data.user) {
        console.log('Login exitoso, guardando sesión');
        // Al iniciar sesión exitosamente, guardamos los datos de la sesión
        saveToStorage(AUTH_SESSION_STORAGE_KEY, response.data.session, { expiration: 7 * 24 * 60 * 60 * 1000 });
        
        // Intentar sincronizar perfiles inmediatamente
        try {
          await syncProfilesWithLocalStorage();
        } catch (syncError) {
          console.error('Error synchronizing profiles after login:', syncError);
        }
        
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
        
        // Guardar usuario y sesión en localStorage
        saveToStorage(AUTH_USER_STORAGE_KEY, newUser, { expiration: 7 * 24 * 60 * 60 * 1000 });
        if (data.session) {
          saveToStorage(AUTH_SESSION_STORAGE_KEY, data.session, { expiration: 7 * 24 * 60 * 60 * 1000 });
        }
        
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
      
      // Eliminar usuario y sesión de localStorage
      removeItem(AUTH_USER_STORAGE_KEY);
      removeItem(AUTH_SESSION_STORAGE_KEY);
      
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
