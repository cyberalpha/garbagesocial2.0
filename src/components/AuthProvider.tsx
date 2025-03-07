import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, getAllUsers } from '@/services/mockData';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  loginWithSocialMedia: (provider: string) => Promise<void>;
  pendingVerification: boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const users = getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (user) {
        if (!user.emailVerified) {
          setPendingVerification(true);
          toast({
            title: t('auth.verificationPending'),
            description: t('auth.verificationSent'),
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        setCurrentUser(user);
        toast({
          title: t('general.success'),
          description: `${t('auth.login')} ${user.name}`,
        });
      } else {
        toast({
          title: t('general.error'),
          description: "Correo electrónico o contraseña incorrectos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante el inicio de sesión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const users = getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        toast({
          title: t('general.error'),
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
        return;
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'publisher',
        isOrganization: false,
        averageRating: 0,
        emailVerified: false,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
      };
      
      const userPreferredLanguage = language;
      
      console.log(`Enviando correo de verificación a ${email} en idioma: ${userPreferredLanguage}`);
      console.log(`Asunto: ${t('email.welcome.subject')}`);
      console.log(`Contenido: ${t('email.welcome.text')}`);
      
      const emailContent = {
        subject: t('email.welcome.subject'),
        title: t('email.welcome.title'),
        text: t('email.welcome.text'),
        buttonText: t('email.welcome.button'),
        footer: t('email.welcome.footer'),
        language: userPreferredLanguage
      };
      
      localStorage.setItem('pendingVerification', JSON.stringify({
        ...newUser,
        language: userPreferredLanguage,
        emailContent
      }));
      
      setPendingVerification(true);
      
      toast({
        title: t('general.success'),
        description: t('auth.verificationSent')
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      toast({
        title: t('general.error'),
        description: "Ocurrió un error durante el registro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      const pendingUser = localStorage.getItem('pendingVerification');
      
      if (pendingUser) {
        const user = JSON.parse(pendingUser);
        user.emailVerified = true;
        
        setCurrentUser(user);
        localStorage.removeItem('pendingVerification');
        setPendingVerification(false);
        
        toast({
          title: t('email.verification.success'),
          description: t('email.verification.successText')
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar correo:', error);
      toast({
        title: t('general.error'),
        description: t('email.verification.failedText')
      });
      return false;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const pendingUser = localStorage.getItem('pendingVerification');
      let userLanguage = language;
      
      if (pendingUser) {
        const user = JSON.parse(pendingUser);
        
        const emailContent = {
          subject: t('email.welcome.subject'),
          title: t('email.welcome.title'),
          text: t('email.welcome.text'),
          buttonText: t('email.welcome.button'),
          footer: t('email.welcome.footer'),
          language: userLanguage
        };
        
        localStorage.setItem('pendingVerification', JSON.stringify({
          ...user,
          language: userLanguage,
          emailContent
        }));
      }
      
      console.log(`Reenviando correo de verificación a ${email} en idioma: ${userLanguage}`);
      console.log(`Asunto: ${t('email.welcome.subject')}`);
      console.log(`Contenido: ${t('email.welcome.text')}`);
      
      toast({
        title: t('general.success'),
        description: t('auth.verificationSent')
      });
    } catch (error) {
      console.error('Error al reenviar correo:', error);
      toast({
        title: t('general.error'),
        description: "No pudimos reenviar el correo. Intenta nuevamente más tarde."
      });
    }
  };

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      console.log(`Iniciando sesión con ${provider}`);
      
      const newUser: User = {
        id: `user-social-${Date.now()}`,
        name: `Usuario de ${provider}`,
        email: `usuario.${provider}@example.com`,
        role: 'publisher',
        isOrganization: false,
        averageRating: 0,
        emailVerified: true,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${provider}`
      };
      
      setCurrentUser(newUser);
      
      toast({
        title: "Sesión iniciada",
        description: `Bienvenido/a ${newUser.name}`
      });
    } catch (error) {
      console.error(`Error al iniciar sesión con ${provider}:`, error);
      toast({
        title: "Error de autenticación",
        description: `No pudimos autenticarte con ${provider}. Por favor, intenta nuevamente.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const switchRole = () => {
    if (!currentUser) return;
    
    const newRole: UserRole = currentUser.role === 'publisher' ? 'recycler' : 'publisher';
    
    setCurrentUser({
      ...currentUser,
      role: newRole
    });
    
    toast({
      title: "Rol cambiado",
      description: `Ahora eres ${newRole === 'publisher' ? 'Publicador' : 'Reciclador'}`,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login, 
      register, 
      logout, 
      switchRole, 
      verifyEmail,
      loginWithSocialMedia,
      pendingVerification,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
