
import { createContext } from 'react';
import { User } from '@/types';

// Update the auth response type to match our implementation
export interface AuthResponseData {
  user: User | null;
  session?: { user: User } | null;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User | null>;
  register: (userData: Partial<User> & { password?: string }) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User | null>;
  deleteProfile: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  loginWithSocialMedia: (provider: string) => Promise<void>;
  pendingVerification: boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
