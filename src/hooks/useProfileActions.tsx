
import { User } from '@/types';
import { useProfileUpdate } from './profile/useProfileUpdate';
import { useProfileDeactivation } from './profile/useProfileDeactivation';
import { useEmailVerification } from './profile/useEmailVerification';
import { useSocialMediaLogin } from './profile/useSocialMediaLogin';

export const useProfileActions = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  logout: () => Promise<void>
) => {
  const { updateProfile } = useProfileUpdate(currentUser, setCurrentUser, setIsLoading);
  const { deleteProfile } = useProfileDeactivation(currentUser, setIsLoading, logout);
  const { verifyEmail, handleResendVerificationEmail } = useEmailVerification(setIsLoading);
  const { loginWithSocialMedia } = useSocialMediaLogin(setIsLoading);

  return {
    updateProfile,
    deleteProfile,
    verifyEmail,
    loginWithSocialMedia,
    handleResendVerificationEmail
  };
};
