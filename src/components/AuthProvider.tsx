import React, { useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, getAllUsers } from '@/services/mockData';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  sendVerificationEmail, 
  generateVerificationToken, 
  generateVerificationUrl,
  prepareVerificationEmail 
} from '@/utils/authUtils';

// Re-export useAuth for backwards compatibility
export { useAuth } from '@/hooks/useAuth';

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

  useEffect(() => {
    const pendingUserData = localStorage.getItem('pendingVerification');
    if (pendingUserData) {
      setPendingVerification(true);
    }
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
      const emailContent = prepareVerificationEmail(t, userPreferredLanguage);
      
      localStorage.setItem('pendingVerification', JSON.stringify({
        ...newUser,
        language: userPreferredLanguage,
        emailContent
      }));
      
      const verificationToken = generateVerificationToken(email);
      const verificationUrl = generateVerificationUrl(verificationToken);
      
      await sendVerificationEmail(
        email, 
        {
          ...emailContent,
          verificationUrl
        },
        userPreferredLanguage
      );
      
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
      setIsLoading(true);
      const pendingUserData = localStorage.getItem('pendingVerification');
      
      if (!pendingUserData) {
        toast({
          title: t('general.error'),
          description: "No hay ninguna verificación pendiente",
          variant: "destructive"
        });
        return;
      }
      
      const pendingUser = JSON.parse(pendingUserData);
      const userLanguage = pendingUser.language || language;
      const emailContent = prepareVerificationEmail(t, userLanguage);
      
      const verificationToken = generateVerificationToken(email);
      const verificationUrl = generateVerificationUrl(verificationToken);
      
      await sendVerificationEmail(
        email, 
        {
          ...emailContent,
          verificationUrl
        },
        userLanguage
      );
      
      localStorage.setItem('pendingVerification', JSON.stringify({
        ...pendingUser,
        language: userLanguage,
        emailContent
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        const handleCredentialResponse = async (response: any) => {
          console.log("Google Auth Response:", response);
          
          if (response.credential) {
            try {
              const decodedToken = decodeJwtResponse(response.credential);
              console.log("Decoded token:", decodedToken);
              
              const googleUser: User = {
                id: `google-${decodedToken.sub}`,
                name: decodedToken.name,
                email: decodedToken.email,
                role: 'publisher',
                isOrganization: false,
                averageRating: 0,
                emailVerified: true,
                profileImage: decodedToken.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${decodedToken.name}`
              };
              
              setCurrentUser(googleUser);
              
              toast({
                title: t('general.success'),
                description: `${t('auth.login')} ${googleUser.name}`,
              });
            } catch (error) {
              console.error('Error processing Google credentials:', error);
              throw error;
            }
          }
        };
        
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: '114112049135-72gbo65i96o08g9dhr1118n94bnkfn7q.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('Google One Tap not displayed or skipped');
              window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButton')!, 
                { theme: 'outline', size: 'large', width: '100%' }
              );
            }
          });
        } else {
          console.error('Google Identity Services library not loaded');
          toast({
            title: t('general.error'),
            description: 'Google authentication service is not available',
            variant: "destructive"
          });
        }
      } else {
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
      }
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
