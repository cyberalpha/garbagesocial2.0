import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAuthActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setPendingVerification: (pending: boolean) => void
) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Handle Supabase session changes
  const handleSessionChange = async (event: any, session: any) => {
    console.log('Evento de sesión detectado:', event, session);
    
    if (event === 'SIGNED_IN') {
      setIsLoading(true);
      const user = session.user;
      
      if (user) {
        try {
          // Get profile data from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching profile from Supabase:', profileError);
          }
          
          // If profile doesn't exist, create it
          if (!profileData) {
            console.log('Profile not found, creating new profile');
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                name: user.user_metadata?.name || user.email?.split('@')[0] || '',
                email: user.email,
                is_organization: user.user_metadata?.isOrganization || false,
                profile_image: user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
              });
              
            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              console.log('Profile created successfully');
            }
          }
          
          // Set current user with profile data if available
          setCurrentUser({
            id: user.id,
            name: profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
            email: user.email || '',
            isOrganization: profileData?.is_organization || user.user_metadata?.isOrganization || false,
            averageRating: profileData?.average_rating || 0,
            profileImage: profileData?.profile_image || user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
            emailVerified: user.email_confirmed_at ? true : false,
            active: true
          });
        } catch (error) {
          console.error('Error handling session change:', error);
        }
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
        
        // Mejorar manejo de error específico para email no confirmado
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email not confirmed') ||
            error.message.includes('email_not_confirmed')) {
          console.log('El email no ha sido confirmado');
          toast({
            title: t('general.error'),
            description: "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
            variant: "destructive"
          });
          setPendingVerification(true);
          return null;
        }
        
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

        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error al obtener perfil:', profileError);
        }
        
        // If profile doesn't exist, create it
        if (!profileData && data.user) {
          console.log('Perfil no encontrado, creando nuevo perfil');
          const profileToCreate = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
            email: data.user.email,
            is_organization: data.user.user_metadata?.isOrganization || false,
            profile_image: data.user.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.email}`
          };
          
          console.log('Creando perfil con datos:', profileToCreate);
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert(profileToCreate);
            
          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('Profile created successfully');
          }
        }
        
        const userObject: User = {
          id: data.user?.id || '',
          name: profileData?.name || data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || '',
          email: data.user?.email || '',
          isOrganization: profileData?.is_organization || data.user?.user_metadata?.isOrganization || false,
          averageRating: profileData?.average_rating || 0,
          profileImage: profileData?.profile_image || data.user?.user_metadata?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${data.user?.email}`,
          emailVerified: data.user?.email_confirmed_at ? true : false,
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
      
      // Verificar si el email ya existe antes de registrar
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .limit(1);
        
      if (checkError) {
        console.error('Error al verificar email existente:', checkError);
      } else if (existingUsers && existingUsers.length > 0) {
        console.log('Email ya registrado:', userData.email);
        toast({
          title: t('general.error'),
          description: "Este email ya está registrado. Por favor utiliza otro o inicia sesión.",
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
        
        // Detectar errores específicos de email ya utilizado
        if (error.message.includes('already registered') || 
            error.message.includes('already in use') || 
            error.message.toLowerCase().includes('duplicate')) {
          toast({
            title: t('general.error'),
            description: "Este email ya está registrado. Por favor utiliza otro o inicia sesión.",
            variant: "destructive"
          });
        } else {
          toast({
            title: t('general.error'),
            description: error.message,
            variant: "destructive"
          });
        }
        return null;
      }
      
      if (data.user) {
        console.log('Usuario creado:', data.user);
        
        // Verificar si necesita verificación de email
        if (!data.user.email_confirmed_at) {
          console.log('El usuario necesita verificar su email');
          setPendingVerification(true);
        }
        
        // Crear el perfil de manera explícita
        const profileToCreate = {
          id: data.user.id,
          name: userData.name || userData.email?.split('@')[0] || '',
          email: userData.email,
          is_organization: userData.isOrganization || false,
          profile_image: userData.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.email}`,
          average_rating: 0
        };
        
        console.log('Creando perfil con datos:', profileToCreate);
        
        // Usamos insert en lugar de upsert ya que es un nuevo perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileToCreate);
          
        if (profileError) {
          console.error('Error al crear perfil:', profileError);
          toast({
            title: t('general.error'),
            description: "Error al crear perfil: " + profileError.message,
            variant: "destructive"
          });
        } else {
          console.log('Perfil creado con éxito');
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
        
        // Actualizar estado
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
      console.log('Iniciando proceso de cierre de sesión');
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
        localStorage.removeItem('supabase.auth.token');
        
        console.log('Sesión cerrada, redirigiendo a inicio');
        toast({
          title: t('general.success'),
          description: "Sesión cerrada correctamente",
        });
        
        setTimeout(() => {
          navigate('/');
        }, 100);
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
