
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, getAllUsers } from '@/services/mockData';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

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

  useEffect(() => {
    // Simular carga de usuario desde localStorage o API
    const loadUser = async () => {
      try {
        // En un entorno real, verificaríamos el token almacenado y haríamos
        // una solicitud para obtener los datos del usuario actual
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
      // Simular inicio de sesión
      const users = getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (user) {
        // Verificar si el usuario ha verificado su correo electrónico
        if (!user.emailVerified) {
          setPendingVerification(true);
          toast({
            title: "Verificación pendiente",
            description: "Por favor, verifica tu correo electrónico antes de iniciar sesión",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        setCurrentUser(user);
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido/a, ${user.name}`,
        });
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: "Correo electrónico o contraseña incorrectos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast({
        title: "Error",
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
      // Simulación de registro
      const users = getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        toast({
          title: "Error de registro",
          description: "Este correo electrónico ya está registrado",
          variant: "destructive"
        });
        return;
      }
      
      // Simular usuario creado
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'publisher',
        isOrganization: false,
        averageRating: 0,
        emailVerified: false, // El usuario no está verificado inicialmente
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
      };
      
      // Simular envío de correo de verificación
      console.log(`Enviando correo de verificación a ${email}`);
      
      // En una implementación real, el usuario no se establecería como currentUser hasta después de la verificación
      // Pero para simular, lo guardamos en localStorage para la verificación
      localStorage.setItem('pendingVerification', JSON.stringify(newUser));
      
      setPendingVerification(true);
      
      toast({
        title: "Registro exitoso",
        description: "Te hemos enviado un correo electrónico de verificación. Por favor, verifica tu correo para completar el registro."
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error durante el registro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      // En una implementación real, se enviaría el token al servidor
      // para verificar y activar la cuenta
      
      // Simulación de verificación exitosa
      const pendingUser = localStorage.getItem('pendingVerification');
      
      if (pendingUser) {
        const user = JSON.parse(pendingUser);
        user.emailVerified = true;
        
        // En una implementación real, el backend actualizaría el usuario en la base de datos
        setCurrentUser(user);
        localStorage.removeItem('pendingVerification');
        setPendingVerification(false);
        
        toast({
          title: "Verificación exitosa",
          description: "Tu cuenta ha sido verificada. ¡Bienvenido/a a GarbageSocial!"
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar correo:', error);
      toast({
        title: "Error de verificación",
        description: "No pudimos verificar tu correo electrónico. Por favor, intenta nuevamente."
      });
      return false;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      // Simulación de reenvío de correo
      console.log(`Reenviando correo de verificación a ${email}`);
      
      toast({
        title: "Correo reenviado",
        description: "Hemos reenviado el correo de verificación. Por favor, revisa tu bandeja de entrada."
      });
    } catch (error) {
      console.error('Error al reenviar correo:', error);
      toast({
        title: "Error",
        description: "No pudimos reenviar el correo. Intenta nuevamente más tarde."
      });
    }
  };

  const loginWithSocialMedia = async (provider: string) => {
    setIsLoading(true);
    try {
      // Simulación de inicio de sesión con redes sociales
      console.log(`Iniciando sesión con ${provider}`);
      
      // En una implementación real, aquí se integraría con el proveedor de autenticación
      // para obtener los datos del usuario
      
      // Simulamos un usuario que ya existe en el sistema
      const newUser: User = {
        id: `user-social-${Date.now()}`,
        name: `Usuario de ${provider}`,
        email: `usuario.${provider}@example.com`,
        role: 'publisher',
        isOrganization: false,
        averageRating: 0,
        emailVerified: true, // Las redes sociales ya verifican el usuario
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
