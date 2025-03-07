
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
      // En una implementación real, enviaríamos los datos al servidor para crear la cuenta
      
      // Verificar si el email ya está registrado
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
        role: 'publisher', // Por defecto, los nuevos usuarios son publicadores
        isOrganization: false,
        averageRating: 0,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${name}` // Avatar generado
      };
      
      // En una implementación real, esto sería manejado por el backend
      setCurrentUser(newUser);
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente"
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
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
