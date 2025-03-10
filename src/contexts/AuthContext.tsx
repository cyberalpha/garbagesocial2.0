
import { createContext } from 'react';
import { User } from '@/types';

// Definimos el formato de respuesta de autenticación para nuestra implementación sin Supabase
export interface AuthResponseData {
  data?: {
    user: User | null;
    session?: { user: User } | null;
  };
  error?: {
    message: string;
  };
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponseData>;
  register: (userData: Partial<User> & { password?: string }) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User | null>;
  deleteProfile: () => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  loginWithSocialMedia: (provider: string) => Promise<void>;
  pendingVerification: boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
