
import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Configurar el listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setIsLoading(true);

        if (session?.user) {
          try {
            // Obtener el perfil del usuario desde la tabla profiles
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching profile:', error);
              setCurrentUser(null);
            } else if (profile) {
              // Convertir el perfil de Supabase al formato User de la aplicación
              const userProfile: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                isOrganization: profile.is_organization,
                averageRating: profile.average_rating,
                profileImage: profile.profile_image,
                emailVerified: true,
                active: profile.active
              };
              setCurrentUser(userProfile);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Verificar la sesión actual al cargar
    const checkCurrentSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Si hay una sesión, obtener el perfil del usuario
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            setCurrentUser(null);
          } else if (profile) {
            // Convertir el perfil de Supabase al formato User de la aplicación
            const userProfile: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              isOrganization: profile.is_organization,
              averageRating: profile.average_rating,
              profileImage: profile.profile_image,
              emailVerified: true,
              active: profile.active
            };
            setCurrentUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error checking current session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentSession();

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error al iniciar sesión:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al iniciar sesión",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('general.success'),
        description: `${t('auth.login')} ${data.user?.email}`,
      });
    } catch (error: any) {
      console.error('Error inesperado al iniciar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password: (userData as any).password || '',
        options: {
          data: {
            name: userData.name,
            isOrganization: userData.isOrganization,
            profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`
          }
        }
      });

      if (error) {
        console.error('Error al registrar usuario:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al registrar usuario",
          variant: "destructive"
        });
        return null;
      }

      // El perfil se crea automáticamente mediante el trigger en Supabase
      toast({
        title: t('general.success'),
        description: "Registro exitoso. ¡Bienvenido!",
      });

      // Devolver el usuario recién creado
      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          name: userData.name || '',
          email: userData.email || '',
          isOrganization: userData.isOrganization || false,
          averageRating: 0,
          profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
          emailVerified: true,
          active: true
        };
        
        return newUser;
      }
      
      return null;
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

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al cerrar sesión",
          variant: "destructive"
        });
        return;
      }
      
      // El cambio de estado de autenticación actualizará currentUser a null
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

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        toast({
          title: t('general.error'),
          description: "Debes iniciar sesión para actualizar tu perfil",
          variant: "destructive"
        });
        return null;
      }

      // Actualizar el perfil en la tabla profiles
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          email: userData.email,
          is_organization: userData.isOrganization,
          profile_image: userData.profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar perfil:', error);
        toast({
          title: t('general.error'),
          description: error.message || "No se pudo actualizar el perfil",
          variant: "destructive"
        });
        return null;
      }

      // Si se cambió el email, actualizar también en Auth
      if (userData.email && userData.email !== currentUser.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: userData.email
        });

        if (updateAuthError) {
          console.error('Error al actualizar email en Auth:', updateAuthError);
          toast({
            title: t('general.error'),
            description: updateAuthError.message || "No se pudo actualizar el email",
            variant: "destructive"
          });
          return null;
        }
      }

      // Convertir el perfil actualizado al formato User
      const updatedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        isOrganization: data.is_organization,
        averageRating: data.average_rating,
        profileImage: data.profile_image,
        emailVerified: true,
        active: data.active
      };

      setCurrentUser(updatedUser);
      
      toast({
        title: t('general.success'),
        description: "Perfil actualizado correctamente"
      });
      
      return updatedUser;
    } catch (error: any) {
      console.error('Error inesperado al actualizar perfil:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante la actualización",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfile = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) {
        toast({
          title: t('general.error'),
          description: "Debes iniciar sesión para desactivar tu perfil",
          variant: "destructive"
        });
        return false;
      }

      // Desactivar el perfil en la tabla profiles (soft delete)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error al desactivar perfil:', error);
        toast({
          title: t('general.error'),
          description: error.message || "No se pudo desactivar el perfil",
          variant: "destructive"
        });
        return false;
      }

      // Cerrar sesión después de desactivar el perfil
      await logout();
      
      toast({
        title: t('general.success'),
        description: "Tu perfil ha sido desactivado. Puedes reactivarlo registrándote nuevamente con el mismo correo electrónico."
      });
      
      return true;
    } catch (error: any) {
      console.error('Error inesperado al desactivar perfil:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Ocurrió un error durante la desactivación",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        console.error('Error al reenviar email de verificación:', error);
        toast({
          title: t('general.error'),
          description: error.message || "Error al reenviar email de verificación",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: t('general.success'),
        description: "Se ha enviado un nuevo correo de verificación"
      });
    } catch (error: any) {
      console.error('Error inesperado al reenviar correo de verificación:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error al reenviar el correo de verificación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    // Esta función no se utiliza directamente con Supabase
    // ya que la verificación se maneja a través de URLs específicas
    return true;
  };

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      let { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error(`Error al iniciar sesión con ${provider}:`, error);
        toast({
          title: t('general.error'),
          description: error.message || `Error al iniciar sesión con ${provider}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error(`Error inesperado al iniciar sesión con ${provider}:`, error);
      toast({
        title: t('general.error'),
        description: error.message || `Ocurrió un error al iniciar sesión con ${provider}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
