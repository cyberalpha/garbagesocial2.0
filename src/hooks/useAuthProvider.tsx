
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useProfileActions } from './useProfileActions';

export const useAuthProvider = () => {
  const {
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification
  } = useAuthState();

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
