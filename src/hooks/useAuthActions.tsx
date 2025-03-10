import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { saveToStorage, getFromStorage, removeItem } from '@/services/localStorage';
import { AuthResponseData } from '@/contexts/AuthContext';

const AUTH_USER_STORAGE_KEY = 'auth_user_data';
const AUTH_SESSION_STORAGE_KEY = 'auth_session_data';

// Base de usuarios demo para pruebas sin Supabase
const demoUsers = [
  {
    id: '1',
    email: 'usuario@ejemplo.com',
    password: 'password123',
    name: 'Usuario Demo',
    isOrganization: false,
    averageRating: 4.5,
    profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Usuario%20Demo',
    emailVerified: true,
    active: true
  },
  {
    id: '2',
    email: 'admin@ejemplo.com',
    password: 'admin123',
    name: 'Administrador',
    isOrganization: true,
    averageRating: 5,
    profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Administrador',
    emailVerified: true,
    active: true
  }
];

export const useAuthActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setPendingVerification: (pending: boolean) => void
) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  // Simulación de cambio de sesión
  const handleSessionChange = async (session: any) => {
    setIsLoading(true);
    try {
      if (session?.user) {
        const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error in session change:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de login sin Supabase
  const login = async (email: string, password: string): Promise<AuthResponseData> => {
    try {
      console.log('Login attempt with email:', email);
      setIsLoading(true);
      
      // Buscar usuario en la base de datos simulada
      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        toast({
          title: t('general.error'),
          description: "Credenciales inválidas. Por favor verifica tu email y contraseña.",
          variant: "destructive"
        });
        return { error: { message: 'Invalid login credentials' } };
      }
      
      // Eliminar la contraseña antes de almacenar el usuario
      const { password: _, ...userWithoutPassword } = user;
      
      setCurrentUser(userWithoutPassword);
      saveToStorage(AUTH_USER_STORAGE_KEY, userWithoutPassword, { expiration: 7 * 24 * 60 * 60 * 1000 });
      
      toast({
        title: t('general.success'),
        description: `${t('auth.login')} exitoso`,
      });
      
      return { data: { user: userWithoutPassword, session: { user: userWithoutPassword } } };
    } catch (error: any) {
      console.error('Error inesperado al iniciar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
      return { error: { message: error.message || "Error desconocido" } };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro sin Supabase
  const register = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      // Verificar si el correo ya existe
      if (demoUsers.some(u => u.email === userData.email)) {
        toast({
          title: t('general.error'),
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
        return null;
      }
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        isOrganization: userData.isOrganization || false,
        averageRating: 0,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        emailVerified: true,
        active: true
      };
      
      // En una aplicación real, aquí guardaríamos el usuario en la base de datos
      
      // Almacenar en localStorage
      saveToStorage(AUTH_USER_STORAGE_KEY, newUser, { expiration: 7 * 24 * 60 * 60 * 1000 });
      
      toast({
        title: t('general.success'),
        description: "Registro exitoso. ¡Bienvenido!",
      });
      
      return newUser;
    } catch (error: any) {
      console.error('Error inesperado al registrar usuario:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante el registro",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout sin Supabase
  const logout = async () => {
    setIsLoading(true);
    try {
      // Eliminar usuario y sesión de localStorage
      removeItem(AUTH_USER_STORAGE_KEY);
      removeItem(AUTH_SESSION_STORAGE_KEY);
      
      setCurrentUser(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error: any) {
      console.error('Error inesperado al cerrar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error al cerrar la sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSessionChange,
    login,
    register,
    logout
  };
};
