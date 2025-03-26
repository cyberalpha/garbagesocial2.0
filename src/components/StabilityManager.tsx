
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

  // Estabilizador para prevenir redirecciones innecesarias
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
    
    // Saltamos la verificación de carga para mostrar el frontend de inmediato
    
    // Ruta protegida + no autenticado = redirigir a login
    if (requiresAuth && !isAuthenticated && !isLoading) {
      console.log('Ruta protegida, usuario no autenticado. Redirigiendo a login...');
      if (currentPath !== '/login') {
        setPendingRoute('/login');
      }
      return;
    }
    
    // Login/registro + autenticado = redirigir a inicio
    if ((currentPath === '/login' || currentPath === '/register') && isAuthenticated && !isLoading) {
      console.log('Usuario autenticado en login/register. Redirigiendo a inicio...');
      setPendingRoute('/');
      return;
    }
    
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
  
  // Renderizar la aplicación de inmediato
  return <>{children}</>;
};

export default StabilityManager;
