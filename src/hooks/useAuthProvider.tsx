import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useProfileActions } from './useProfileActions';
import { supabase } from '@/integrations/supabase/client';

export const useAuthProvider = () => {
  const {
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification
  } = useAuthState();

  // Inicializar desde la sesión de Supabase en lugar de localStorage
  const initializeFromSupabase = async () => {
    try {
      if (!currentUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Usuario restaurado desde sesión de Supabase:', session.user);
          
          // Obtener datos del perfil del usuario desde Supabase
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error al obtener perfil:', error);
          }
          
          if (profileData) {
            // Verificar si el perfil está desactivado por el nombre
            if (profileData.name && profileData.name.startsWith('DELETED_')) {
              console.log('Este perfil está desactivado');
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
              active: true
            };
            setCurrentUser(user);
          } else {
            // Si aún no existe un perfil pero el usuario está autenticado
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
            
            // Crear el perfil en Supabase
            const { error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                name: user.name,
                email: user.email,
                is_organization: user.isOrganization,
                profile_image: user.profileImage,
                average_rating: 0
              }, {
                onConflict: 'id'
              });
            
            if (createError) {
              console.error('Error al crear perfil en Supabase:', createError);
            } else {
              console.log('Perfil creado automáticamente en Supabase');
            }
            
            setCurrentUser(user);
          }
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error al inicializar desde Supabase:', error);
      setIsLoading(false);
    }
  };

  // Inicializar desde Supabase cuando se carga el componente
  if (!currentUser && !isLoading) {
    setIsLoading(true);
    initializeFromSupabase();
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
      // No localStorage operations
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
      // No localStorage operations
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
