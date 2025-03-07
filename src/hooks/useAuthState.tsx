
import { useState } from 'react';
import { User } from '@/types';

export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);

  return {
    currentUser,
    setCurrentUser,
    isLoading,
    setIsLoading,
    pendingVerification,
    setPendingVerification
  };
};
