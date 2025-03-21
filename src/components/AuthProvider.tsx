
import React, { ReactNode } from 'react';
import useAuthProvider from '@/hooks/useAuthProvider';
import { useSessionManager } from '@/hooks/useSessionManager';
import { AuthContext } from '@/contexts/AuthContext';

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
      pendingVerification,
      resendVerificationEmail: handleResendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
