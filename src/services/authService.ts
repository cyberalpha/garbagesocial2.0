
import { User } from '@/types';

// Simulación de un servicio de autenticación sin Supabase
export const loginUser = async (email: string, password: string) => {
  console.log('Simulando inicio de sesión para:', email);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Esta función ahora es solo un proxy para la lógica en useAuthActions
      resolve({ data: null, error: null });
    }, 500);
  });
};

export const registerUser = async (userData: Partial<User> & { password?: string }) => {
  console.log('Simulando registro para:', userData.email);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Esta función ahora es solo un proxy para la lógica en useAuthActions
      resolve({ data: { user: null }, error: null });
    }, 500);
  });
};

export const logoutUser = async () => {
  console.log('Simulando cierre de sesión');
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ error: null });
    }, 500);
  });
};

export const getUserProfile = async (userId: string) => {
  console.log('Simulando obtención de perfil para:', userId);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: null, error: null });
    }, 500);
  });
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  console.log('Simulando actualización de perfil para:', userId);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: null, error: null });
    }, 500);
  });
};

export const updateUserEmail = async (email: string) => {
  console.log('Simulando actualización de email para:', email);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: null, error: null });
    }, 500);
  });
};

export const deactivateProfile = async (userId: string) => {
  console.log('Simulando desactivación de perfil para:', userId);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ error: null });
    }, 500);
  });
};

export const getCurrentSession = async () => {
  console.log('Simulando obtención de sesión actual');
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: null, error: null });
    }, 500);
  });
};

export const resendVerificationEmail = async (email: string) => {
  console.log('Simulando reenvío de email de verificación para:', email);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ error: null });
    }, 500);
  });
};

export const loginWithProvider = async (provider: string) => {
  console.log('Simulando inicio de sesión con proveedor:', provider);
  
  // En una aplicación real, esto sería una llamada a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ error: null });
    }, 500);
  });
};
