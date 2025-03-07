
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
  const [pendingVerification, setPendingVerification] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Iniciando sesión con: ${email}`);
      const user = getActiveUserByEmail(email);
      
      if (user) {
        // Verificar si el correo está verificado
        if (!user.emailVerified) {
          setPendingVerification(true);
          toast({
            title: t('general.error'),
            description: "Por favor verifica tu correo electrónico antes de iniciar sesión",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
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
        // If the user is already active but not verified, we should just resend the verification email
        if (!existingActiveUser.emailVerified) {
          await sendVerificationEmail(existingActiveUser.email);
          setPendingVerification(true);
          toast({
            title: t('general.info'),
            description: "Esta cuenta ya existe pero necesita verificación. Hemos enviado un nuevo correo de verificación."
          });
          return existingActiveUser;
        }

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
          active: true,  // Reactivate the user
          emailVerified: false  // Requerir verificación de correo nuevamente
        };
        
        const reactivatedUser = updateUser(existingInactiveUser.id, updatedUserData);
        
        if (reactivatedUser) {
          toast({
            title: t('general.success'),
            description: "¡Bienvenido de vuelta! Tu cuenta ha sido reactivada. Por favor verifica tu correo electrónico."
          });
          
          // Enviar correo de verificación
          await sendVerificationEmail(reactivatedUser.email);
          setPendingVerification(true);
          
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
        emailVerified: false, // Requiere verificación de correo
        active: true
      };
      
      // Save user to our mock database
      const savedUser = addUser(newUser);
      
      // Enviar correo de verificación
      await sendVerificationEmail(savedUser.email);
      setPendingVerification(true);
      
      toast({
        title: t('general.success'),
        description: "Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta."
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

      // Si se cambia el correo, verificar que no esté ya registrado
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
        
        // Si se cambia el correo, requerir verificación
        userData.emailVerified = false;
      }

      // Update user in the database
      const updatedUser = updateUser(currentUser.id, userData);
      
      if (updatedUser) {
        // Si se cambió el correo electrónico, enviar verificación
        if (userData.email && userData.email !== currentUser.email) {
          await sendVerificationEmail(updatedUser.email);
          setPendingVerification(true);
          toast({
            title: t('general.success'),
            description: "Perfil actualizado correctamente. Por favor verifica tu nuevo correo electrónico."
          });
          logout(); // Cerrar sesión para forzar la verificación
        } else {
          setCurrentUser(updatedUser);
          toast({
            title: t('general.success'),
            description: "Perfil actualizado correctamente"
          });
        }
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

  // Función para enviar correo de verificación (simulada)
  const sendVerificationEmail = async (email: string) => {
    console.log(`Enviando correo de verificación a ${email}`);
    // En un entorno real, aquí se enviaría el correo con un token único
    // Para esta simulación, solo registramos en consola
    
    // Simulamos un delay para simular el envío del correo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: t('general.success'),
      description: `Se ha enviado un correo de verificación a ${email}`
    });
    
    return true;
  };
  
  // Función para reenviar el correo de verificación
  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      await sendVerificationEmail(email);
      toast({
        title: t('general.success'),
        description: "Se ha reenviado el correo de verificación"
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
  
  // Función para verificar el correo electrónico con un token
  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      // En un entorno real, aquí verificaríamos el token con el backend
      // Para esta simulación, asumimos que cualquier token es válido
      
      if (!currentUser) {
        toast({
          title: t('general.error'),
          description: "No hay usuario para verificar",
          variant: "destructive"
        });
        return false;
      }
      
      // Actualizar el usuario con emailVerified = true
      const updatedUser = updateUser(currentUser.id, { emailVerified: true });
      
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setPendingVerification(false);
        toast({
          title: t('general.success'),
          description: "Correo electrónico verificado correctamente"
        });
        return true;
      } else {
        toast({
          title: t('general.error'),
          description: "No se pudo verificar el correo electrónico",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error al verificar correo:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante la verificación",
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
      verifyEmail,
      loginWithSocialMedia: async () => {}, // Simplificado
      pendingVerification,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
