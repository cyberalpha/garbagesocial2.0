
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { offlineMode } from '@/integrations/supabase/client';
import { setSessionToken, clearSessionToken } from '@/utils/sessionManager';
import { mockUsers, createMockUser, removeMockUser } from '@/utils/mockUsers';

export const useAuthActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setPendingVerification: (pending: boolean) => void
) => {
  const [lastError, setLastError] = useState<Error | null>(null);

  const handleSessionChange = async (event: string, session: any) => {
    console.log('Evento de sesión detectado:', event, session);
    
    try {
      setIsLoading(true);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('Usuario inició sesión:', session.user);
        
        // Si estamos en modo offline, usar datos simulados
        if (offlineMode()) {
          console.log('Modo offline activo, usando datos simulados para sesión');
          const mockUser = mockUsers.find(u => u.email === session.user.email);
          
          if (mockUser) {
            setCurrentUser(mockUser);
          } else {
            // Si no existe, crear usuario simulado
            const newMockUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
              email: session.user.email || '',
              isOrganization: false,
              profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`,
              averageRating: 0,
              emailVerified: true,
              active: true
            };
            createMockUser(newMockUser);
            setCurrentUser(newMockUser);
          }
        } else {
          // En modo online, intentar obtener perfil de Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw profileError;
          }
          
          if (profileData) {
            const user: User = {
              id: profileData.id,
              name: profileData.name || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              isOrganization: profileData.is_organization || false,
              averageRating: profileData.average_rating || 0,
              profileImage: profileData.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`,
              emailVerified: session.user.email_confirmed_at ? true : false,
              active: true
            };
            setCurrentUser(user);
          } else {
            // Si no hay perfil, crearlo automáticamente
            const newUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              isOrganization: session.user.user_metadata?.isOrganization || false,
              averageRating: 0,
              profileImage: session.user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`,
              emailVerified: session.user.email_confirmed_at ? true : false,
              active: true
            };
            
            // Crear perfil en Supabase
            const { error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                is_organization: newUser.isOrganization,
                profile_image: newUser.profileImage,
                average_rating: 0,
                active: true
              });
            
            if (createError) {
              console.error('Error creating profile:', createError);
              throw createError;
            }
            
            setCurrentUser(newUser);
          }
        }
        
        // Guardar token en localStorage para mantener sesión
        if (session?.access_token) {
          setSessionToken(session.access_token, session.refresh_token);
        }
        
      } else if (['SIGNED_OUT', 'USER_DELETED'].includes(event)) {
        console.log('Usuario cerró sesión o fue eliminado');
        setCurrentUser(null);
        clearSessionToken();
      }
    } catch (error) {
      console.error('Error handling session change:', error);
      setLastError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<User | null> => {
    console.log("Iniciando proceso de login con email:", credentials.email);
    setIsLoading(true);
    setLastError(null);
    
    try {
      // Si estamos en modo offline, usar autenticación simulada
      if (offlineMode()) {
        console.log('Modo offline activo, simulando login');
        
        // Verificar credenciales contra usuarios mock
        const mockUser = mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        );
        
        if (mockUser) {
          console.log('Login simulado exitoso');
          setTimeout(() => {
            // Simular evento de sesión
            handleSessionChange('SIGNED_IN', { 
              user: { 
                id: mockUser.id, 
                email: mockUser.email,
                user_metadata: {
                  name: mockUser.name,
                  isOrganization: mockUser.isOrganization
                }
              },
              access_token: 'fake-token-' + Date.now(),
              refresh_token: 'fake-refresh-token-' + Date.now()
            });
          }, 100);
          return mockUser;
        } else {
          console.log('Login simulado fallido');
          throw new Error('Credenciales inválidas');
        }
      }
      
      // En modo online, usar autenticación real de Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error('Error en login:', error);
        
        // Verificar si es un error de verificación de email
        if (error.message?.includes('Email not confirmed')) {
          setPendingVerification(true);
        }
        
        throw error;
      }
      
      if (!data?.user) {
        throw new Error('No se recibieron datos de usuario');
      }
      
      // La sesión se manejará en el evento SIGNED_IN
      console.log('Login exitoso, esperando evento de sesión');
      return null;
      
    } catch (error: any) {
      console.error('Error en login:', error);
      setLastError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password?: string }): Promise<User | null> => {
    console.log("Registrando usuario:", userData.email);
    setIsLoading(true);
    setLastError(null);
    
    try {
      const { name, email, password, isOrganization, profileImage } = userData;
      
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      // Si estamos en modo offline, crear usuario simulado
      if (offlineMode()) {
        console.log('Modo offline activo, creando usuario simulado');
        
        // Verificar si ya existe
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          throw new Error('Este email ya está registrado');
        }
        
        const mockUser: User & { password: string } = {
          id: 'mock-' + Date.now(),
          name: name || email.split('@')[0],
          email,
          password,
          isOrganization: isOrganization || false,
          profileImage: profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
          averageRating: 0,
          emailVerified: true,
          active: true
        };
        
        createMockUser(mockUser);
        
        // Simular evento de inicio de sesión
        setTimeout(() => {
          handleSessionChange('SIGNED_IN', { 
            user: { 
              id: mockUser.id, 
              email: mockUser.email,
              user_metadata: {
                name: mockUser.name,
                isOrganization: mockUser.isOrganization
              }
            },
            access_token: 'fake-token-' + Date.now(),
            refresh_token: 'fake-refresh-token-' + Date.now()
          });
        }, 100);
        
        return mockUser;
      }
      
      // En modo online, registrar con Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isOrganization,
            profileImage: profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
          }
        }
      });
      
      if (error) {
        console.error('Error en registro:', error);
        throw error;
      }
      
      if (!data?.user) {
        throw new Error('No se recibieron datos de usuario');
      }
      
      // Verificar si requiere confirmación de email
      if (!data.user.email_confirmed_at) {
        console.log('Usuario registrado, pendiente de confirmación');
        setPendingVerification(true);
      }
      
      // El perfil se creará automáticamente mediante el trigger en Supabase
      
      console.log('Registro exitoso, usuario creado');
      return null;
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      setLastError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log("Ejecutando logout...");
    setIsLoading(true);
    setLastError(null);
    
    try {
      // Siempre eliminar datos localmente primero
      clearSessionToken();
      
      // Si estamos en modo offline, solo limpiar el estado
      if (offlineMode()) {
        console.log('Modo offline activo, simulando logout');
        setCurrentUser(null);
        return;
      }
      
      // En modo online, hacer logout en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error en logout:', error);
        throw error;
      }
      
      // Limpiar usuario (por si acaso el evento no se dispara)
      setCurrentUser(null);
      console.log('Logout exitoso');
      
    } catch (error: any) {
      console.error('Error en logout:', error);
      setLastError(error);
      
      // Forzar logout local incluso si hay error en Supabase
      setCurrentUser(null);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSessionChange,
    login,
    register,
    logout,
    lastError
  };
};
