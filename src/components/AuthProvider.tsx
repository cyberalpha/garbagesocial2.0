
import React, { ReactNode, useEffect } from 'react';
import { useAuthProvider } from '@/hooks/useAuthProvider';
import { useSessionManager } from '@/hooks/useSessionManager';
import { AuthContext } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

// Export the auth hook
export { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  // Set up session manager
  useSessionManager({ 
    handleSessionChange, 
    setIsLoading 
  });
  
  // Verificar redirecciones cuando el estado de autenticación cambia
  useEffect(() => {
    // Si no está cargando y está en una ruta protegida sin usuario, redirigir
    if (!isLoading && !currentUser) {
      const protectedRoutes = ['/map', '/publish', '/profile', '/waste/'];
      
      // Verificar si la ruta actual es protegida
      const isProtectedRoute = protectedRoutes.some(route => 
        location.pathname === route || 
        (route.endsWith('/') && location.pathname.startsWith(route))
      );
      
      if (isProtectedRoute) {
        console.log('Redirigiendo a login desde ruta protegida:', location.pathname);
        navigate('/login');
      }
    }
    
    // Si está en login/register y ya está autenticado, redirigir a inicio
    if (!isLoading && currentUser) {
      const authRoutes = ['/login', '/register'];
      if (authRoutes.includes(location.pathname)) {
        console.log('Usuario autenticado en ruta de auth, redirigiendo a inicio');
        navigate('/');
      }
    }
  }, [currentUser, isLoading, location.pathname, navigate]);

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
