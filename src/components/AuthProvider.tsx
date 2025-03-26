
import React, { ReactNode } from 'react';
import useAuthProvider from '@/hooks/useAuthProvider';
import { useSessionManager } from '@/hooks/useSessionManager';
import { AuthContext } from '@/contexts/AuthContext';
import { User } from '@/types'; // Añadimos la importación del tipo User

// Export the auth hook
export { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
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
    handleResendVerificationEmail,
    toggleOfflineMode
  } = useAuthProvider();

  // Set up session manager
  useSessionManager({ 
    handleSessionChange, 
    setIsLoading 
  });

  // Adaptamos las funciones de login y register para que coincidan con las firmas esperadas
  const adaptedLogin = async (credentials: { email: string; password: string }) => {
    const result = await login(credentials.email, credentials.password);
    if (!result.success && result.error) {
      throw result.error;
    }
    return currentUser!;
  };

  const adaptedRegister = async (userData: Partial<User> & { password?: string }) => {
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Email, contraseña y nombre son requeridos');
    }
    
    const result = await register(
      userData.email, 
      userData.password, 
      userData.name, 
      userData.isOrganization
    );
    
    if (!result.success && result.error) {
      throw result.error;
    }
    return currentUser!;
  };

  const adaptedLogout = async () => {
    await logout();
  };

  const adaptedResendVerification = async (email: string) => {
    await handleResendVerificationEmail(email);
  };

  // Implementación básica de loginWithSocialMedia para satisfacer el tipo AuthContextType
  const loginWithSocialMedia = async (provider: string) => {
    console.warn('Login con redes sociales no implementado:', provider);
    throw new Error('La funcionalidad de login con redes sociales no está implementada actualmente');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login: adaptedLogin, 
      register: adaptedRegister, 
      logout: adaptedLogout,
      updateProfile,
      deleteProfile,
      verifyEmail,
      pendingVerification,
      resendVerificationEmail: adaptedResendVerification,
      loginWithSocialMedia // Añadimos la propiedad faltante
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
