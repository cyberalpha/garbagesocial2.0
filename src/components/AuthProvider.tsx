
import React, { ReactNode } from 'react';
import { useAuthProvider } from '@/hooks/useAuthProvider';
import { useSessionManager } from '@/hooks/useSessionManager';
import { AuthContext } from '@/contexts/AuthContext';

// Exportar el hook de autenticación
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
    loginWithSocialMedia,
    handleResendVerificationEmail
  } = useAuthProvider();

  // Configurar el gestor de sesiones
  useSessionManager({ 
    handleSessionChange, 
    setIsLoading 
  });

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
      loginWithSocialMedia,
      pendingVerification,
      resendVerificationEmail: handleResendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
