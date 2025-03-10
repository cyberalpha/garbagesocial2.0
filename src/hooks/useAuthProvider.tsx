
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Restored user from Supabase session:', session.user);
          
          // Get user profile data from Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileData) {
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
            // If no profile exists yet but user is authenticated
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
