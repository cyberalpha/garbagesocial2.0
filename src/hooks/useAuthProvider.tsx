
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useProfileActions } from './useProfileActions';
import { getFromStorage, saveToStorage } from '@/services/localStorage';

// Clave para almacenar el usuario en localStorage
const AUTH_USER_STORAGE_KEY = 'auth_user_data';

export const useAuthProvider = () => {
  const {
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification
  } = useAuthState();

  // Inicializamos el estado con el usuario del localStorage si existe
  const initializeFromLocalStorage = () => {
    try {
      const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
      if (savedUser && !currentUser) {
        console.log('Restaurando usuario desde localStorage:', savedUser);
        setCurrentUser(savedUser);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error al inicializar desde localStorage:', error);
    }
  };

  // Inicializamos el estado al montar el componente
  if (!currentUser) {
    initializeFromLocalStorage();
  }

  const {
    handleSessionChange,
    login,
    register,
    logout
  } = useAuthActions(
    currentUser,
    (user) => {
      setCurrentUser(user);
      // Guardamos el usuario en localStorage cuando se actualiza
      if (user) {
        console.log('Guardando usuario en localStorage:', user);
        saveToStorage(AUTH_USER_STORAGE_KEY, user, { expiration: 7 * 24 * 60 * 60 * 1000 }); // 7 días
        
        // También guardamos en el localStorage estándar para asegurar compatibilidad
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        // Si el usuario es null (logout), eliminamos del localStorage
        console.log('Eliminando usuario de localStorage');
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    },
    setIsLoading,
    setPendingVerification
  );

  const {
    updateProfile,
    deleteProfile,
    verifyEmail,
    loginWithSocialMedia,
    handleResendVerificationEmail
  } = useProfileActions(
    currentUser,
    (user) => {
      setCurrentUser(user);
      // Actualizamos el usuario en localStorage
      if (user) {
        console.log('Actualizando usuario en localStorage:', user);
        saveToStorage(AUTH_USER_STORAGE_KEY, user, { expiration: 7 * 24 * 60 * 60 * 1000 });
        
        // También en localStorage estándar
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      }
    },
    setIsLoading,
    logout
  );

  return {
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
  };
};
