
import { User } from '@/types';

// Función para convertir el perfil de Supabase al formato User
export const mapProfileToUser = (profile: any): User => {
  // Verificar si el perfil es válido
  if (!profile || !profile.id) {
    console.error('Perfil inválido:', profile);
    throw new Error('Perfil de usuario inválido o incompleto');
  }
  
  console.log('Mapeando perfil a usuario:', profile);
  
  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    isOrganization: profile.is_organization === true,
    averageRating: profile.average_rating || 0,
    profileImage: profile.profile_image || '',
    emailVerified: true,
    // Si active es explícitamente false, entonces será false, en cualquier otro caso será true
    active: profile.active !== false  // Si es undefined o null, será true
  };
};

// Función para convertir de nuestro formato User al formato de perfil de Supabase
export const mapUserToProfile = (user: User): any => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    is_organization: user.isOrganization,
    profile_image: user.profileImage,
    active: user.active !== false
  };
};

// Función para verificar si un usuario está activo
export const isUserActive = (user: User | null): boolean => {
  if (!user) return false;
  return user.active !== false; // Si es undefined o null, consideramos que está activo
};

// Función para crear un nombre de usuario único
export const createUniqueUsername = (email: string, name?: string): string => {
  const timestamp = Date.now().toString(36);
  if (name && name.trim().length > 0) {
    // Reemplazar espacios y caracteres especiales
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${safeName}_${timestamp.substring(timestamp.length - 4)}`;
  }
  // Usar parte del email si no hay nombre
  const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${emailPrefix}_${timestamp.substring(timestamp.length - 4)}`;
};
