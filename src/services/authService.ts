
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Función para iniciar sesión
export const loginUser = async (email: string, password: string) => {
  console.log('Intentando iniciar sesión con:', email);
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Log para depuración
    console.log('Respuesta de login:', response);
    
    return response;
  } catch (error) {
    console.error('Error de autenticación:', error);
    throw error;
  }
};

// Función para registrar un usuario
export const registerUser = async (userData: Partial<User> & { password?: string }) => {
  console.log('Registrando usuario con email:', userData.email);
  try {
    const response = await supabase.auth.signUp({
      email: userData.email || '',
      password: userData.password || '',
      options: {
        data: {
          name: userData.name,
          isOrganization: userData.isOrganization,
          profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`
        }
      }
    });
    
    // Log para depuración
    console.log('Respuesta de registro:', response);
    
    if (response.error) {
      throw response.error;
    }
    
    return response;
  } catch (error) {
    console.error('Error de registro:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  return await supabase.auth.signOut();
};

// Función para obtener el perfil del usuario
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error al obtener perfil:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error inesperado en getUserProfile:', error);
    return { data: null, error };
  }
};

// Función para actualizar el perfil
export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  return await supabase
    .from('profiles')
    .update({
      name: userData.name,
      email: userData.email,
      is_organization: userData.isOrganization,
      profile_image: userData.profileImage,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
};

// Función para actualizar el email en Auth
export const updateUserEmail = async (email: string) => {
  return await supabase.auth.updateUser({
    email
  });
};

// Función para desactivar el perfil
export const deactivateProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .update({ 
      active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
};

// Verificar la sesión actual
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener la sesión actual:', error);
    }
    return { data, error };
  } catch (error) {
    console.error('Error inesperado en getCurrentSession:', error);
    return { data: null, error };
  }
};

// Función para reenviar el email de verificación
export const resendVerificationEmail = async (email: string) => {
  return await supabase.auth.resend({
    type: 'signup',
    email: email
  });
};

// Función para iniciar sesión con redes sociales
export const loginWithProvider = async (provider: string) => {
  return await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: window.location.origin
    }
  });
};
