
import React, { useState, useEffect, ReactNode } from 'react';
import { getAllUsers, addUser, getUserByEmail, updateUser, deleteUser } from '@/services/mockData';
import { User, UserRole } from '@/types';
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
      const users = getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (user) {
        setCurrentUser(user);
        toast({
          title: t('general.success'),
          description: `${t('auth.login')} ${user.name}`,
        });
      } else {
        toast({
          title: t('general.error'),
          description: "Correo electrónico o contraseña incorrectos",
          variant: "destructive"
        });
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
      // Check if user already exists
      const existingUser = getUserByEmail(userData.email || '');
      
      if (existingUser) {
        toast({
          title: t('general.error'),
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
        return null;
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'publisher',
        isOrganization: userData.isOrganization || false,
        averageRating: 0,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        emailVerified: true // Simplificamos el proceso de verificación
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

      // If email is being changed, check that it's not already taken
      if (userData.email && userData.email !== currentUser.email) {
        const existingUser = getUserByEmail(userData.email);
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
          description: "Debes iniciar sesión para eliminar tu perfil",
          variant: "destructive"
        });
        return false;
      }

      // Delete user from the database
      const success = deleteUser(currentUser.id);
      
      if (success) {
        setCurrentUser(null);
        toast({
          title: t('general.success'),
          description: "Perfil eliminado correctamente"
        });
        return true;
      } else {
        toast({
          title: t('general.error'),
          description: "No se pudo eliminar el perfil",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante la eliminación",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = () => {
    if (!currentUser) return;
    
    const newRole: UserRole = currentUser.role === 'publisher' ? 'recycler' : 'publisher';
    
    setCurrentUser({
      ...currentUser,
      role: newRole
    });
    
    toast({
      title: "Rol cambiado",
      description: `Ahora eres ${newRole === 'publisher' ? 'Publicador' : 'Reciclador'}`,
    });
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
      switchRole,
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
