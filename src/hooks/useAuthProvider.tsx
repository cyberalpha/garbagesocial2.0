import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { offlineMode } from '@/integrations/supabase/client';

// Hook para manejar acciones del perfil de usuario
export const useProfileActions = () => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<Error | null>(null);

  // Actualizar perfil de usuario
  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    try {
      // Validar datos
      if (!userData.id) {
        throw new Error("ID de usuario requerido para actualizar perfil");
      }
      
      // Obtener perfil actual del localStorage
      const storedProfiles = JSON.parse(localStorage.getItem('profiles') || '{}');
      const currentProfile = storedProfiles[userData.id] || {};
      
      // Actualizar con nuevos datos
      const updatedProfile: User = {
        ...currentProfile,
        ...userData,
      };
      
      // Guardar en localStorage
      storedProfiles[userData.id] = updatedProfile;
      localStorage.setItem('profiles', JSON.stringify(storedProfiles));
      
      // Actualizar en Supabase si está online
      if (!offlineMode()) {
        // Mapear datos a formato Supabase
        const supabaseData = {
          id: updatedProfile.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          is_organization: updatedProfile.isOrganization,
          profile_image: updatedProfile.profileImage
        };
        
        const { error } = await supabase
          .from('profiles')
          .upsert(supabaseData);
        
        if (error) {
          console.error('Error actualizando perfil en Supabase:', error);
          // No bloquear la operación, solo registrar el error
        }
      }
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      });
      
      return updatedProfile;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const err = error instanceof Error ? error : new Error('Error desconocido al actualizar perfil');
      setLastError(err);
      
      toast({
        title: "Error al actualizar perfil",
        description: err.message,
        variant: "destructive"
      });
      
      throw err;
    }
  };
  
  // Eliminar perfil de usuario
  const deleteProfile = async (shouldDeactivate = false): Promise<void> => {
    try {
      // Obtener usuario actual del localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        throw new Error("No hay usuario activo");
      }
      
      const currentUser = JSON.parse(currentUserStr);
      
      if (!shouldDeactivate) {
        // Eliminar datos del usuario
        const storedProfiles = JSON.parse(localStorage.getItem('profiles') || '{}');
        delete storedProfiles[currentUser.id];
        localStorage.setItem('profiles', JSON.stringify(storedProfiles));
        
        // Eliminar usuario actual
        localStorage.removeItem('currentUser');
        
        // Eliminar en Supabase si está online
        if (!offlineMode()) {
          // Esta operación requiere autenticación en Supabase
          console.log('Operación de eliminación de perfil en Supabase no implementada en modo desconectado');
        }
        
        toast({
          title: "Perfil eliminado",
          description: "Tu perfil ha sido eliminado correctamente",
        });
      } else {
        // Desactivar perfil
        const storedProfiles = JSON.parse(localStorage.getItem('profiles') || '{}');
        const profileData = storedProfiles[currentUser.id];
        
        if (profileData) {
          profileData.active = false;
          storedProfiles[currentUser.id] = profileData;
          localStorage.setItem('profiles', JSON.stringify(storedProfiles));
          localStorage.removeItem('currentUser');
          
          // Desactivar en Supabase si está online
          if (!offlineMode()) {
            const { error } = await supabase
              .from('profiles')
              .update({ active: false })
              .eq('id', currentUser.id);
            
            if (error) {
              console.error('Error desactivando perfil en Supabase:', error);
            }
          }
          
          toast({
            title: "Perfil desactivado",
            description: "Tu perfil ha sido desactivado correctamente",
          });
        }
      }
    } catch (error) {
      console.error('Error al eliminar/desactivar perfil:', error);
      const err = error instanceof Error ? error : new Error('Error desconocido al eliminar perfil');
      setLastError(err);
      
      toast({
        title: "Error al eliminar perfil",
        description: err.message,
        variant: "destructive"
      });
      
      throw err;
    }
  };
  
  // Verificar email (placeholder para cuando hay backend)
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      // En modo offline, simplemente simular éxito
      toast({
        title: "Email verificado",
        description: "Tu correo electrónico ha sido verificado correctamente (simulado en modo offline)",
      });
      
      return true;
    } catch (error) {
      console.error('Error al verificar email:', error);
      const err = error instanceof Error ? error : new Error('Error desconocido al verificar email');
      setLastError(err);
      
      toast({
        title: "Error al verificar email",
        description: err.message,
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Reenviar email de verificación (placeholder)
  const handleResendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      // En modo offline, simplemente simular éxito
      toast({
        title: "Email enviado",
        description: "Se ha enviado un correo de verificación a tu dirección de email (simulado en modo offline)",
      });
      
      return true;
    } catch (error) {
      console.error('Error al reenviar email de verificación:', error);
      const err = error instanceof Error ? error : new Error('Error desconocido al reenviar verificación');
      setLastError(err);
      
      toast({
        title: "Error al enviar email",
        description: err.message,
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Cambiar modo offline
  const toggleOfflineMode = async (): Promise<boolean> => {
    try {
      const newMode = !offlineMode();
      localStorage.setItem('offline_mode', newMode ? 'true' : 'false');
      
      window.dispatchEvent(new CustomEvent('offlinemodechange', { 
        detail: { offlineMode: newMode } 
      }));
      
      toast({
        title: newMode ? "Modo offline activado" : "Modo offline desactivado",
        description: newMode 
          ? "La aplicación funcionará sin conexión a internet" 
          : "La aplicación se conectará a internet para sincronizar datos",
      });
      
      return true;
    } catch (error) {
      console.error('Error al cambiar modo offline:', error);
      return false;
    }
  };

  return {
    updateProfile,
    deleteProfile,
    verifyEmail,
    handleResendVerificationEmail,
    toggleOfflineMode,
    lastError
  };
};

const useAuthProvider = () => {
  const {
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification
  } = useAuthState();

  // Initialize from Supabase session instead of localStorage
  const initializeFromSupabase = async () => {
    try {
      if (!currentUser) {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('User restored from Supabase session:', session.user);
          
          // Get user profile data from Supabase
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching profile:', error);
            setIsLoading(false);
            return;
          }
          
          if (profileData) {
            // Check if profile is deactivated
            const isDeactivated = profileData.name && profileData.name.startsWith('DELETED_');
            // Verificar si el perfil está explícitamente marcado como inactivo
            // Nota: Como 'active' no existe en el tipo, utilizamos una verificación segura
            const isActiveExplicitly = 'active' in profileData ? profileData.active === true : true;
            
            if (isDeactivated || !isActiveExplicitly) {
              console.log('Este perfil está desactivado');
              // Cerrar sesión automáticamente si el perfil está desactivado
              await supabase.auth.signOut();
              setCurrentUser(null);
              setIsLoading(false);
              return;
            }
            
            const user = {
              id: profileData.id,
              name: profileData.name || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              isOrganization: profileData.is_organization || false,
              averageRating: profileData.average_rating || 0,
              profileImage: profileData.profile_image || '',
              emailVerified: session.user.email_confirmed_at ? true : false,
              // Utilizamos una verificación segura para la propiedad 'active'
              active: 'active' in profileData ? profileData.active !== false : true
            };
            setCurrentUser(user);
          } else {
            // Si el perfil no existe pero el usuario está autenticado, crearlo
            console.log('Creating profile for authenticated user without profile');
            const user = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              isOrganization: session.user.user_metadata?.isOrganization || false,
              averageRating: 0,
              profileImage: session.user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`,
              emailVerified: session.user.email_confirmed_at ? true : false,
              active: true
            };
            
            // Crear explícitamente el perfil en Supabase
            const { error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                name: user.name,
                email: user.email,
                is_organization: user.isOrganization,
                profile_image: user.profileImage,
                average_rating: 0,
                active: true
              }, {
                onConflict: 'id'
              });
            
            if (createError) {
              console.error('Error creating profile in Supabase:', createError);
            } else {
              console.log('Profile automatically created in Supabase');
            }
            
            setCurrentUser(user);
          }
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing from Supabase:', error);
      setIsLoading(false);
    }
  };

  // Initialize from Supabase when component loads
  if (!currentUser && !isLoading) {
    initializeFromSupabase();
  }

  const {
    handleSessionChange,
    login,
    register,
    logout
  } = useAuthActions(
    currentUser,
    setCurrentUser,
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
    setCurrentUser,
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

export default useAuthProvider;
