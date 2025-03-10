
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { saveToStorage, getFromStorage, removeItem } from '@/services/localStorage';
import { AuthResponseData } from '@/contexts/AuthContext';
import { supabase, offlineMode, testConnection } from '@/integrations/supabase/client';

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
      console.log("Session change detected:", session);
      if (session?.user) {
        // Si tenemos un usuario en la sesión, actualizar el estado
        const userData = session.user;
        
        // Convertir formato de usuario de Supabase a formato interno
        const user: User = {
          id: userData.id,
          email: userData.email || '',
          name: userData.user_metadata?.name || userData.email?.split('@')[0] || '',
          isOrganization: userData.user_metadata?.isOrganization || false,
          averageRating: userData.user_metadata?.averageRating || 0,
          profileImage: userData.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.email}`,
          emailVerified: userData.email_confirmed_at ? true : false,
          active: true
        };
        
        setCurrentUser(user);
        console.log("User set from session:", user);
        saveToStorage(AUTH_USER_STORAGE_KEY, user, { expiration: 7 * 24 * 60 * 60 * 1000 });
      } else {
        // Si no hay sesión, verificar si hay usuario en localStorage
        const savedUser = getFromStorage(AUTH_USER_STORAGE_KEY, null);
        if (savedUser && offlineMode) {
          // En modo offline, permitir restaurar desde localStorage
          setCurrentUser(savedUser);
          console.log("Restored user from localStorage (offline mode):", savedUser);
        } else {
          // En modo online sin sesión, limpiar usuario
          setCurrentUser(null);
          console.log("No session and not in offline mode, cleared user");
        }
      }
    } catch (error) {
      console.error('Error in session change:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de login que intenta primero con Supabase y luego con el modo offline
  const login = async (email: string, password: string): Promise<AuthResponseData> => {
    try {
      console.log('Login attempt with email:', email);
      setIsLoading(true);
      
      // Comprobar conectividad a Supabase primero
      if (!offlineMode) {
        try {
          console.log('Testing Supabase connection before login...');
          const connectionTest = await testConnection();
          
          if (connectionTest.success) {
            console.log('Supabase connection successful, attempting login');
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              if (error) {
                console.error('Supabase auth error:', error);
                toast({
                  title: t('general.error'),
                  description: error.message || "Error al iniciar sesión",
                  variant: "destructive"
                });
                return { error: { message: error.message } };
              }
              
              if (data && data.user) {
                console.log('Login successful with Supabase:', data.user);
                
                // Convertir formato de usuario de Supabase a formato interno
                const user: User = {
                  id: data.user.id,
                  email: data.user.email || '',
                  name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
                  isOrganization: data.user.user_metadata?.isOrganization || false,
                  averageRating: data.user.user_metadata?.averageRating || 0,
                  profileImage: data.user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.email}`,
                  emailVerified: data.user.email_confirmed_at ? true : false,
                  active: true
                };
                
                setCurrentUser(user);
                saveToStorage(AUTH_USER_STORAGE_KEY, user, { expiration: 7 * 24 * 60 * 60 * 1000 });
                
                toast({
                  title: t('general.success'),
                  description: `${t('auth.login')} exitoso`,
                });
                
                return { 
                  data: { 
                    user: user,
                    session: { user: user } 
                  } 
                };
              }
            } catch (supabaseAuthError) {
              console.error('Unexpected error during Supabase auth:', supabaseAuthError);
              // Continuar con el modo offline si hay un error inesperado
            }
          } else {
            console.warn('Supabase connection failed, using offline mode:', connectionTest.error);
            toast({
              title: "Modo offline activado",
              description: "No se pudo conectar a Supabase, usando modo offline",
              variant: "default" // Changed from "warning" to "default"
            });
          }
        } catch (connectionError) {
          console.error('Error testing Supabase connection:', connectionError);
          // Continuar con el modo offline si hay un error de conexión
        }
      } else {
        console.log('Offline mode is active, skipping Supabase login attempt');
      }
      
      // Modo offline / demo users
      console.log('Using offline/demo mode for login');
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
        description: `${t('auth.login')} exitoso (modo offline)`,
      });
      
      return { 
        data: { 
          user: userWithoutPassword,
          session: { user: userWithoutPassword } 
        } 
      };
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

  // Función de registro que intenta primero con Supabase y luego con el modo offline
  const register = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      // Si no estamos en modo offline, intentar con Supabase
      if (!offlineMode && userData.email && userData.password) {
        try {
          // Comprobar conectividad a Supabase primero
          console.log('Testing Supabase connection before registration...');
          const connectionTest = await testConnection();
          
          if (connectionTest.success) {
            console.log('Supabase connection successful, attempting registration');
            try {
              const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                  data: {
                    name: userData.name || '',
                    isOrganization: userData.isOrganization || false,
                    profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
                  }
                }
              });
              
              if (error) {
                console.error('Error de Supabase en registro:', error);
                toast({
                  title: t('general.error'),
                  description: error.message || "Error al registrar usuario",
                  variant: "destructive"
                });
                return null;
              }
              
              if (data && data.user) {
                const newUser: User = {
                  id: data.user.id,
                  name: userData.name || '',
                  email: userData.email,
                  isOrganization: userData.isOrganization || false,
                  averageRating: 0,
                  profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
                  emailVerified: false,
                  active: true
                };
                
                // En Supabase real, el usuario debe confirmar su email antes de iniciar sesión
                setPendingVerification(true);
                
                toast({
                  title: t('general.success'),
                  description: "Registro exitoso. Por favor verifica tu email para continuar.",
                });
                
                return newUser;
              }
            } catch (supabaseError) {
              console.error('Error inesperado con Supabase en registro:', supabaseError);
              // Si hay un error con Supabase, pasamos al modo demo
            }
          } else {
            console.warn('Supabase connection failed for registration, using offline mode:', connectionTest.error);
            toast({
              title: "Modo offline activado",
              description: "No se pudo conectar a Supabase, usando modo offline para registro",
              variant: "default" // Changed from "warning" to "default"
            });
          }
        } catch (connectionError) {
          console.error('Error testing Supabase connection for registration:', connectionError);
          // Continuar con el modo offline si hay un error de conexión
        }
      } else {
        console.log('Offline mode is active or missing email/password, using offline mode for registration');
      }
      
      // Modo offline / demo
      console.log('Usando modo offline/demo para registro');
      
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
        description: "Registro exitoso en modo offline. ¡Bienvenido!",
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

  // Función de logout que maneja tanto Supabase como modo offline
  const logout = async () => {
    setIsLoading(true);
    try {
      // Si no estamos en modo offline, intentar con Supabase
      if (!offlineMode) {
        try {
          console.log('Attempting Supabase logout');
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Error de Supabase en logout:', error);
            // Si falla Supabase, continuamos con el logout local
          } else {
            console.log('Supabase logout successful');
          }
        } catch (supabaseError) {
          console.error('Error inesperado con Supabase en logout:', supabaseError);
          // Si hay un error con Supabase, hacemos logout local
        }
      } else {
        console.log('Offline mode active, performing only local logout');
      }
      
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
