
import { createContext } from 'react';
import { User } from '@/types';

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<User | null>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<User | null>;
  deleteProfile: () => Promise<boolean>;
  switchRole: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  loginWithSocialMedia: (provider: string) => Promise<void>;
  pendingVerification: boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
