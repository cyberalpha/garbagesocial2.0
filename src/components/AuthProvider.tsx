
import React, { useState, useEffect, ReactNode } from 'react';
import { getAllUsers } from '@/services/mockData';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from './LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  sendVerificationEmail, 
  generateVerificationToken, 
  generateVerificationUrl,
  prepareVerificationEmail,
  decodeJwtResponse
} from '@/utils/authUtils';

export { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

interface PendingVerificationData {
  name: string;
  email: string;
  verificationToken: string;
  language: string;
  emailContent: any;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    // Comprobar si hay una verificación pendiente al cargar
    const pendingUserData = localStorage.getItem('pendingVerification');
    if (pendingUserData) {
      try {
        const parsedData = JSON.parse(pendingUserData) as PendingVerificationData;
        setPendingVerification(true);
        setPendingEmail(parsedData.email || '');
        console.log('Hay una verificación de correo pendiente para:', parsedData.email);
      } catch (error) {
        console.error('Error al procesar datos pendientes:', error);
        localStorage.removeItem('pendingVerification');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Intentando iniciar sesión con: ${email}`);
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
      console.log(`Registrando nuevo usuario: ${name} (${email})`);
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
      
      // Crear nuevo usuario sin verificar
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
      
      // Preparar el contenido del correo según el idioma del usuario
      const userPreferredLanguage = language;
      const emailContent = prepareVerificationEmail(t, userPreferredLanguage);
      
      // Generar token y URL de verificación
      const verificationToken = generateVerificationToken(email);
      const verificationUrl = generateVerificationUrl(verificationToken);
      
      console.log("Enviando correo de verificación a:", email);
      
      // Simular envío de correo
      await sendVerificationEmail(
        email, 
        {
          ...emailContent,
          verificationUrl
        },
        userPreferredLanguage
      );
      
      // Guardar los datos del usuario pendiente en localStorage
      const pendingData: PendingVerificationData = {
        name,
        email,
        verificationToken,
        language: userPreferredLanguage,
        emailContent
      };
      
      localStorage.setItem('pendingVerification', JSON.stringify(pendingData));
      
      setPendingVerification(true);
      setPendingEmail(email);
      
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
      console.log('Verificando token de correo:', token);
      const pendingUserData = localStorage.getItem('pendingVerification');
      
      if (pendingUserData) {
        const pendingUser = JSON.parse(pendingUserData) as PendingVerificationData;
        
        // Verificar que el token sea válido
        if (token) {
          console.log('Token válido, usuario verificado');
          
          // Crear el usuario verificado
          const user: User = {
            id: `user-${Date.now()}`,
            name: pendingUser.name,
            email: pendingUser.email,
            role: 'publisher',
            isOrganization: false,
            averageRating: 0,
            emailVerified: true,
            profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${pendingUser.name}`
          };
          
          console.log('Usuario verificado:', user);
          
          // Establecer el usuario actual y eliminar la verificación pendiente
          setCurrentUser(user);
          localStorage.removeItem('pendingVerification');
          setPendingVerification(false);
          setPendingEmail('');
          
          toast({
            title: t('email.verification.success'),
            description: t('email.verification.successText')
          });
          
          return true;
        }
      }
      
      console.log('No se encontró ninguna verificación pendiente o token inválido');
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
      console.log("Intentando reenviar correo de verificación a:", email);
      
      const pendingUserData = localStorage.getItem('pendingVerification');
      
      if (!pendingUserData) {
        console.error("No hay datos de usuario pendiente");
        toast({
          title: t('general.error'),
          description: "No hay ninguna verificación pendiente",
          variant: "destructive"
        });
        return;
      }
      
      const pendingUser = JSON.parse(pendingUserData) as PendingVerificationData;
      
      // Si no se proporciona un correo electrónico, usar el almacenado
      const emailToUse = email || pendingUser.email;
      
      if (!emailToUse) {
        console.error("No se pudo determinar el correo electrónico para reenviar");
        toast({
          title: t('general.error'),
          description: "No se pudo determinar el correo electrónico para reenviar",
          variant: "destructive"
        });
        return;
      }
      
      // Preparar nuevo token y URL de verificación
      const verificationToken = generateVerificationToken(emailToUse);
      const verificationUrl = generateVerificationUrl(verificationToken);
      
      const userLanguage = pendingUser.language || language;
      const emailContent = prepareVerificationEmail(t, userLanguage);
      
      console.log("Reenviando correo de verificación a:", emailToUse);
      console.log("URL de verificación:", verificationUrl);
      
      // Simular reenvío de correo
      await sendVerificationEmail(
        emailToUse, 
        {
          ...emailContent,
          verificationUrl
        },
        userLanguage
      );
      
      // Actualizar los datos del usuario pendiente con el nuevo token
      const updatedPendingData: PendingVerificationData = {
        name: pendingUser.name,
        email: emailToUse,
        verificationToken,
        language: userLanguage,
        emailContent
      };
      
      localStorage.setItem('pendingVerification', JSON.stringify(updatedPendingData));
      setPendingEmail(emailToUse);
      
      toast({
        title: t('general.success'),
        description: t('auth.verificationResent')
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
    console.log(`Inicio de sesión con ${provider} está desactivado temporalmente`);
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
