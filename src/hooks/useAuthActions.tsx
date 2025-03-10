
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setPendingVerification: (pending: boolean) => void
) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  // Handle Supabase session changes
  const handleSessionChange = (event: any, session: any) => {
    console.log('Evento de sesión detectado:', event, session);
    
    if (event === 'SIGNED_IN') {
      setIsLoading(true);
      const user = session.user;
      
      if (user) {
        // No guardar en localStorage, actualizar estado
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          isOrganization: user.user_metadata?.isOrganization || false,
          averageRating: 0,
          profileImage: user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
          emailVerified: user.email_confirmed_at ? true : false,
          active: true
        });
      }
      
      setIsLoading(false);
    } else if (event === 'SIGNED_OUT') {
      setCurrentUser(null);
    }
  };

  // Login with email and password
  const login = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      console.log(`Intentando iniciar sesión para ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error de inicio de sesión:', error.message);
        toast({
          title: t('general.error'),
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      if (data.session) {
        console.log('Sesión creada:', data.session);
        toast({
          title: t('general.success'),
          description: "Inicio de sesión exitoso",
        });

        // No guardar en localStorage, actualizar estado
        const user = data.user;
        
        // Obtener datos del perfil del usuario desde Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error al obtener perfil:', profileError);
        }
        
        const userObject: User = {
          id: user?.id || '',
          name: profileData?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || '',
          email: user?.email || '',
          isOrganization: profileData?.is_organization || user?.user_metadata?.isOrganization || false,
          averageRating: profileData?.average_rating || 0,
          profileImage: profileData?.profile_image || user?.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`,
          emailVerified: user?.email_confirmed_at ? true : false,
          active: true
        };
        
        setCurrentUser(userObject);
        
        return userObject;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error inesperado:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error inesperado durante el inicio de sesión",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      console.log('Registrando usuario:', {
        ...userData,
        password: userData.password ? "********" : undefined
      });
      
      if (!userData.email || !userData.password) {
        toast({
          title: t('general.error'),
          description: "Email y contraseña son obligatorios",
          variant: "destructive"
        });
        return null;
      }
      
      // Registrar en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            isOrganization: userData.isOrganization,
            profileImage: userData.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.email}`
          }
        }
      });
      
      if (error) {
        console.error('Error en registro:', error.message);
        toast({
          title: t('general.error'),
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      if (data.user) {
        console.log('Usuario creado:', data.user);
        
        // Verificar si necesita verificación de email
        if (!data.user.email_confirmed_at) {
          console.log('El usuario necesita verificar su email');
          setPendingVerification(true);
        }
        
        // Create profile with service role to bypass RLS
        const { data: adminClient } = await supabase.auth.getSession();
        
        // First, create profile as the authenticated user
        const { error: profileError, data: profileData } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: userData.name || userData.email?.split('@')[0] || '',
            email: userData.email,
            is_organization: userData.isOrganization || false,
            profile_image: userData.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.email}`,
            average_rating: 0
          }, {
            onConflict: 'id'
          })
          .select();
          
        if (profileError) {
          console.error('Error al crear perfil:', profileError);
          toast({
            title: t('general.error'),
            description: "Error al crear perfil: " + profileError.message,
            variant: "destructive"
          });
        } else {
          console.log('Perfil creado con éxito:', profileData);
        }
        
        const user: User = {
          id: data.user.id,
          name: userData.name || userData.email?.split('@')[0] || '',
          email: userData.email,
          isOrganization: userData.isOrganization || false,
          averageRating: 0,
          profileImage: userData.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.email}`,
          emailVerified: data.user.email_confirmed_at ? true : false,
          active: true
        };
        
        // Actualizar estado (no usar localStorage)
        setCurrentUser(user);
        
        toast({
          title: t('general.success'),
          description: data.user.email_confirmed_at 
            ? "¡Registro completado con éxito!" 
            : "Registro exitoso. Por favor verifica tu email.",
        });
        
        return user;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error inesperado en registro:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error inesperado durante el registro",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast({
          title: t('general.error'),
          description: error.message,
          variant: "destructive"
        });
      } else {
        setCurrentUser(null);
        
        toast({
          title: t('general.success'),
          description: "Sesión cerrada correctamente",
        });
      }
    } catch (error: any) {
      console.error('Error inesperado al cerrar sesión:', error);
      toast({
        title: t('general.error'),
        description: error.message || "Error al cerrar sesión",
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
