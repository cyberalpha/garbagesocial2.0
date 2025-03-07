
import React, { useState, useEffect, ReactNode } from 'react';
import { 
  getAllUsers, 
  addUser, 
  getActiveUserByEmail, 
  updateUser, 
  deleteUser, 
  getUserByEmail,
  getUserById
} from '@/services/mockData';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';

export { useAuth } from '@/hooks/useAuth';

// LocalStorage key
const CURRENT_USER_KEY = 'current_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUserJson = localStorage.getItem(CURRENT_USER_KEY);
        console.log('Loading user from localStorage:', savedUserJson);
        
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          // Verify the user still exists and is active in our database
          const existingUser = getUserById(savedUser.id);
          console.log('Existing user from database:', existingUser);
          
          if (existingUser && existingUser.active !== false) {
            console.log('Setting current user from localStorage');
            setCurrentUser(existingUser);
          } else {
            console.log('User not found in database or inactive, clearing localStorage');
            // Clear invalid user data
            localStorage.removeItem(CURRENT_USER_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem(CURRENT_USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      console.log('Saving user to localStorage:', currentUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Iniciando sesión con: ${email}`);
      const user = getActiveUserByEmail(email);
      
      if (user) {
        setCurrentUser(user);
        toast({
          title: t('general.success'),
          description: `${t('auth.login')} ${user.name}`,
        });
      } else {
        const inactiveUser = getUserByEmail(email);
        if (inactiveUser && inactiveUser.active === false) {
          toast({
            title: t('general.error'),
            description: "Tu cuenta está desactivada. Registrate nuevamente para reactivarla.",
            variant: "destructive"
          });
        } else {
          toast({
            title: t('general.error'),
            description: "Correo electrónico o contraseña incorrectos",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      console.log(`Registrando usuario: ${userData.name} (${userData.email})`);
      const existingActiveUser = getActiveUserByEmail(userData.email || '');
      
      if (existingActiveUser) {
        toast({
          title: t('general.error'),
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
        return null;
      }
      
      const existingInactiveUser = getUserByEmail(userData.email || '');
      if (existingInactiveUser && existingInactiveUser.active === false) {
        console.log('Reactivando usuario:', existingInactiveUser.id);
        
        const updatedUserData = {
          ...existingInactiveUser,
          name: userData.name || existingInactiveUser.name,
          isOrganization: userData.isOrganization !== undefined ? userData.isOrganization : existingInactiveUser.isOrganization,
          active: true,
          emailVerified: true
        };
        
        const reactivatedUser = updateUser(existingInactiveUser.id, updatedUserData);
        
        if (reactivatedUser) {
          toast({
            title: t('general.success'),
            description: "¡Bienvenido de vuelta! Tu cuenta ha sido reactivada."
          });
          setCurrentUser(reactivatedUser);
          return reactivatedUser;
        }
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        isOrganization: userData.isOrganization || false,
        averageRating: 0,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        emailVerified: true,
        active: true
      };
      
      const savedUser = addUser(newUser);
      setCurrentUser(savedUser);
      
      toast({
        title: t('general.success'),
        description: "Registro exitoso. ¡Bienvenido!"
      });
      
      return savedUser;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante el registro",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setPendingVerification(false);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
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

      if (userData.email && userData.email !== currentUser.email) {
        const existingUser = getActiveUserByEmail(userData.email);
        if (existingUser && existingUser.id !== currentUser.id) {
          toast({
            title: t('general.error'),
            description: "Este correo electrónico ya está registrado",
            variant: "destructive"
          });
          return null;
        }
        
        userData.emailVerified = true;
      }

      const updatedUser = updateUser(currentUser.id, userData);
      
      if (updatedUser) {
        setCurrentUser(updatedUser);
        toast({
          title: t('general.success'),
          description: "Perfil actualizado correctamente"
        });
        return updatedUser;
      } else {
        toast({
          title: t('general.error'),
          description: "No se pudo actualizar el perfil",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante la actualización",
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

      const success = deleteUser(currentUser.id);
      
      if (success) {
        setCurrentUser(null);
        toast({
          title: t('general.success'),
          description: "Tu perfil ha sido desactivado. Puedes reactivarlo registrándote nuevamente con el mismo correo electrónico."
        });
        return true;
      } else {
        toast({
          title: t('general.error'),
          description: "No se pudo desactivar el perfil",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error al desactivar perfil:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante la desactivación",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    console.log(`Simulando envío de correo de verificación a ${email} (desactivado)`);
    return true;
  };
  
  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      await sendVerificationEmail(email);
      toast({
        title: t('general.success'),
        description: "Se ha simulado el reenvío del correo de verificación (verificación desactivada)"
      });
    } catch (error) {
      console.error('Error al reenviar correo de verificación:', error);
      toast({
        title: t('general.error'),
        description: "Error al reenviar el correo de verificación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyEmail = async (token: string) => {
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login, 
      register, 
      logout,
      updateProfile,
      deleteProfile,
      verifyEmail,
      loginWithSocialMedia: async () => {},
      pendingVerification: false,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
