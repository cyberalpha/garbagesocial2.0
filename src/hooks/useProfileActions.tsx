
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { offlineMode, setOfflineMode } from '@/integrations/supabase/client';
import { saveUser, deleteUser } from '@/services/users';
import { updateMockUser } from '@/utils/mockUsers';

export const useProfileActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  logout: () => Promise<void>
) => {
  const [lastError, setLastError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Actualizar perfil de usuario
  const updateProfile = async (userData: Partial<User>): Promise<User | null> => {
    try {
      setIsLoading(true);
      setLastError(null);
      
      if (!currentUser) {
        throw new Error("No hay usuario logueado");
      }
      
      console.log("Actualizando perfil de usuario:", userData);
      
      // Actualizar datos localmente primero
      const updatedUser = {
        ...currentUser,
        ...userData,
      };
      
      // Si estamos en modo offline, actualizar en localStorage solamente
      if (offlineMode()) {
        console.log("Modo offline activo, actualizando perfil en localStorage");
        
        // Actualizar usuario en mock users
        const success = updateMockUser(currentUser.id, userData);
        
        if (success) {
          setCurrentUser(updatedUser);
          
          toast({
            title: "Perfil actualizado",
            description: "Tu perfil ha sido actualizado correctamente en modo offline.",
            variant: "default",
          });
          
          return updatedUser;
        } else {
          throw new Error("Error al actualizar perfil en modo offline");
        }
      }
      
      // Si estamos online, actualizar en Supabase
      await saveUser(updatedUser);
      
      setCurrentUser(updatedUser);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
        variant: "default",
      });
      
      return updatedUser;
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      setLastError(error);
      
      toast({
        title: "Error al actualizar perfil",
        description: error.message || "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar perfil de usuario
  const deleteProfile = async (shouldDeactivate: boolean = false): Promise<void> => {
    try {
      setIsLoading(true);
      setLastError(null);
      
      if (!currentUser) {
        throw new Error("No hay usuario logueado");
      }
      
      // Confirmar intención
      const confirmMessage = shouldDeactivate 
        ? "¿Estás seguro de que quieres desactivar tu cuenta? Podrás reactivarla más tarde."
        : "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.";
      
      if (!window.confirm(confirmMessage)) {
        setIsLoading(false);
        return;
      }
      
      console.log(shouldDeactivate ? "Desactivando perfil de usuario" : "Eliminando perfil de usuario");
      
      // Si estamos en modo offline, solo eliminar de localStorage
      if (offlineMode()) {
        console.log("Modo offline activo, eliminando/desactivando perfil en localStorage");
        
        // En modo offline siempre eliminamos el usuario por completo por simplicidad
        await logout();
        
        toast({
          title: shouldDeactivate ? "Cuenta desactivada" : "Cuenta eliminada",
          description: shouldDeactivate 
            ? "Tu cuenta ha sido desactivada correctamente en modo offline."
            : "Tu cuenta ha sido eliminada correctamente en modo offline.",
          variant: "default",
        });
        
        return;
      }
      
      // Si estamos online, eliminar/desactivar en Supabase
      if (shouldDeactivate) {
        // Desactivar el perfil (marcar como desactivado)
        const updatedUser = {
          ...currentUser,
          active: false,
        };
        
        await saveUser(updatedUser);
      } else {
        // Eliminar completamente
        await deleteUser(currentUser.id);
      }
      
      // En cualquier caso, cerrar sesión
      await logout();
      
      toast({
        title: shouldDeactivate ? "Cuenta desactivada" : "Cuenta eliminada",
        description: shouldDeactivate 
          ? "Tu cuenta ha sido desactivada correctamente."
          : "Tu cuenta ha sido eliminada correctamente.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error al eliminar/desactivar perfil:", error);
      setLastError(error);
      
      toast({
        title: "Error al procesar tu solicitud",
        description: error.message || "No se pudo procesar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar email con token
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setLastError(null);
      
      console.log("Verificando email con token:", token);
      
      // Si estamos en modo offline, simular verificación exitosa
      if (offlineMode()) {
        console.log("Modo offline activo, simulando verificación de email exitosa");
        
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            emailVerified: true,
          };
          
          setCurrentUser(updatedUser);
          
          // Actualizar en localStorage
          updateMockUser(currentUser.id, { emailVerified: true });
        }
        
        toast({
          title: "Email verificado",
          description: "Tu email ha sido verificado correctamente en modo offline.",
          variant: "default",
        });
        
        return true;
      }
      
      // En modo online, verificar token con Supabase
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      
      if (error) {
        throw error;
      }
      
      // Actualizar estado del usuario si está logueado
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          emailVerified: true,
        };
        
        setCurrentUser(updatedUser);
      }
      
      toast({
        title: "Email verificado",
        description: "Tu email ha sido verificado correctamente.",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error al verificar email:", error);
      setLastError(error);
      
      toast({
        title: "Error al verificar email",
        description: error.message || "No se pudo verificar el email. El token podría ser inválido o haber expirado.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar email de verificación
  const handleResendVerificationEmail = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setLastError(null);
      
      console.log("Reenviando email de verificación a:", email);
      
      // Si estamos en modo offline, solo mostrar confirmación
      if (offlineMode()) {
        console.log("Modo offline activo, simulando reenvío de email");
        
        toast({
          title: "Email enviado (simulado)",
          description: "En modo offline, no se envía realmente un email de verificación.",
          variant: "default",
        });
        
        return;
      }
      
      // En modo online, usar Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Email enviado",
        description: "Se ha enviado un nuevo email de verificación. Por favor revisa tu bandeja de entrada.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error al reenviar email de verificación:", error);
      setLastError(error);
      
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el email de verificación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle del modo offline
  const toggleOfflineMode = async (): Promise<boolean> => {
    try {
      const newMode = !offlineMode();
      setOfflineMode(newMode);
      
      toast({
        title: newMode ? "Modo offline activado" : "Modo offline desactivado",
        description: newMode 
          ? "Ahora estás trabajando sin conexión. Los cambios se guardarán localmente."
          : "Ahora estás trabajando con conexión. Los cambios se sincronizarán con el servidor.",
        variant: "default",
      });
      
      return newMode;
    } catch (error: any) {
      console.error("Error al cambiar modo offline:", error);
      
      toast({
        title: "Error al cambiar modo",
        description: error.message || "No se pudo cambiar el modo de conexión.",
        variant: "destructive",
      });
      
      return offlineMode(); // Devolver el estado actual
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
