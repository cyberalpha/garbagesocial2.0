
import React, { useState, useEffect, ReactNode } from 'react';
import { 
  getAllUsers, 
  addUser, 
  getActiveUserByEmail, 
  updateUser, 
  deleteUser, 
  getUserByEmail 
} from '@/services/mockData';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';

export { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
        // Check if user exists but is inactive
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
      // Check if user already exists and is active
      const existingActiveUser = getActiveUserByEmail(userData.email || '');
      
      if (existingActiveUser) {
        toast({
          title: t('general.error'),
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
        return null;
      }
      
      // Check if user exists but is inactive (for reactivation)
      const existingInactiveUser = getUserByEmail(userData.email || '');
      if (existingInactiveUser && existingInactiveUser.active === false) {
        console.log('Reactivando usuario:', existingInactiveUser.id);
        
        // Update user data for reactivation
        const updatedUserData = {
          ...existingInactiveUser,
          name: userData.name || existingInactiveUser.name,
          isOrganization: userData.isOrganization !== undefined ? userData.isOrganization : existingInactiveUser.isOrganization,
          active: true  // Reactivate the user
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
      
      // Create new user if no reactivation
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        isOrganization: userData.isOrganization || false,
        averageRating: 0,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        emailVerified: true, // Simplificamos el proceso de verificación
        active: true
      };
      
      // Save user to our mock database
      const savedUser = addUser(newUser);
      
      toast({
        title: t('general.success'),
        description: t('auth.registerSuccess')
      });
      
      // Auto-login with the new user
      setCurrentUser(savedUser);
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

      // If email is being changed, check that it's not already taken by an active user
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
      }

      // Update user in the database
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

      // Soft delete (deactivate) user
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

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login, 
      register, 
      logout,
      updateProfile,
      deleteProfile,
      verifyEmail: async () => false, // Simplificado
      loginWithSocialMedia: async () => {}, // Simplificado
      pendingVerification: false, // Simplificado
      resendVerificationEmail: async () => {} // Simplificado
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
