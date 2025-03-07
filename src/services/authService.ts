import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Función para iniciar sesión
export const loginUser = async (email: string, password: string) => {
  console.log('Attempting login with:', email);
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Log the response for debugging
    console.log('Login response:', response);
    
    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Función para registrar un usuario
export const registerUser = async (userData: Partial<User> & { password?: string }) => {
  console.log('Registering user with email:', userData.email);
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
    
    // Log the response for debugging
    console.log('Registration response:', response);
    
    if (response.error) {
      throw response.error;
    }
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  return await supabase.auth.signOut();
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

// Función para obtener el perfil del usuario
export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};
