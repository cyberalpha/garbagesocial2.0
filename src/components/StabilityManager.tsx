
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ROUTES_REQUIRING_AUTH = [
  '/profile',
  '/map',
  '/publish',
  '/waste'
];

const StabilityManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();
  const [isStable, setIsStable] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [lastAuthState, setLastAuthState] = useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
    currentRoute: string;
  }>({
    isLoading: true,
    isAuthenticated: false,
    currentRoute: '/'
  });

  // Estabilizador para prevenir parpadeo y redirecciones innecesarias
  useEffect(() => {
    const currentPath = location.pathname;
    const requiresAuth = ROUTES_REQUIRING_AUTH.some(route => 
      currentPath === route || currentPath.startsWith(`${route}/`)
    );
    const isAuthenticated = !!currentUser;
    
    // Siempre registrar el último estado para comparación
    const newState = {
      isLoading,
      isAuthenticated,
      currentRoute: currentPath
    };
    
    // Si nada ha cambiado, no hacer nada
    if (
      lastAuthState.isLoading === newState.isLoading &&
      lastAuthState.isAuthenticated === newState.isAuthenticated &&
      lastAuthState.currentRoute === newState.currentRoute
    ) {
      return;
    }
    
    setLastAuthState(newState);
    
    // Si estamos cargando, esperar
    if (isLoading) {
      setIsStable(false);
      return;
    }
    
    // Ruta protegida + no autenticado = redirigir a login
    if (requiresAuth && !isAuthenticated) {
      console.log('Ruta protegida, usuario no autenticado. Redirigiendo a login...');
      if (currentPath !== '/login') {
        setPendingRoute('/login');
      }
      return;
    }
    
    // Login/registro + autenticado = redirigir a inicio
    if ((currentPath === '/login' || currentPath === '/register') && isAuthenticated) {
      console.log('Usuario autenticado en login/register. Redirigiendo a inicio...');
      setPendingRoute('/');
      return;
    }
    
    // Estabilizar la aplicación
    setIsStable(true);
    
  }, [currentUser, isLoading, location.pathname, lastAuthState]);
  
  // Efecto para manejar redirecciones pendientes
  useEffect(() => {
    if (pendingRoute && !isLoading) {
      const timeoutId = setTimeout(() => {
        console.log(`Redirigiendo a ${pendingRoute}...`);
        navigate(pendingRoute);
        setPendingRoute(null);
      }, 100); // Pequeño retraso para evitar redirecciones rápidas
      
      return () => clearTimeout(timeoutId);
    }
  }, [pendingRoute, isLoading, navigate]);
  
  // Mostrar indicador de carga si la aplicación no está estable
  if (!isStable || isLoading) {
    // Vista de carga para toda la aplicación
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }
  
  // Renderizar la aplicación una vez que esté estable
  return <>{children}</>;
};

export default StabilityManager;
