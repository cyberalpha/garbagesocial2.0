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
