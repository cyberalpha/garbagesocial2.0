
import { User } from '@/types';

// Función para convertir el perfil de Supabase al formato User
export const mapProfileToUser = (profile: any): User => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    isOrganization: profile.is_organization,
    averageRating: profile.average_rating,
    profileImage: profile.profile_image,
    emailVerified: true,
    active: profile.active !== false  // Si es undefined o null, será true
  };
};
