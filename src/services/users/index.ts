
import { User, Waste } from "@/types";
import { USERS_STORAGE_KEY, initialUsers } from "./constants";
import { getWastes } from "../wastes";
import { getOfflineProfiles } from "@/utils/supabaseConnectionUtils";
import { offlineMode } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { safeTableAccess } from "@/utils/supabaseMockUtils";
import { transformSupabaseWaste } from "../wastes/utils";

/**
 * Get all users from localStorage
 */
export const getUsers = (): User[] => {
  if (offlineMode()) {
    // Si estamos en modo offline, intentamos obtener los perfiles de la caché
    const offlineProfiles = getOfflineProfiles();
    if (offlineProfiles && offlineProfiles.length > 0) {
      console.log(`Usando ${offlineProfiles.length} perfiles desde modo offline`);
      // Convertir el formato de Supabase al formato de User
      return offlineProfiles.map((profile: any) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        isOrganization: profile.is_organization,
        averageRating: profile.average_rating || 0,
        profileImage: profile.profile_image,
        emailVerified: true,
        active: true
      }));
    }
  }
  
  // If not offline mode, try to get users from Supabase
  return [];
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  console.log('getUserById llamado con id:', id);
  
  if (!id) {
    console.error('ID de usuario inválido:', id);
    return null;
  }
  
  // Primero intentar obtener de Supabase
  try {
    console.log('Intentando obtener usuario de Supabase con ID:', id);
    const { data, error } = await safeTableAccess('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error al obtener perfil de Supabase:', error);
    } else if (data) {
      console.log('Perfil encontrado en Supabase:', data);
      
      // Verificar si el perfil está desactivado
      if (data.name && data.name.startsWith('DELETED_')) {
        console.log('Este perfil está desactivado');
        return null;
      }
      
      // Convertir el formato de Supabase al formato User
      const user: User = {
        id: data.id,
        name: data.name || 'Usuario',
        email: data.email || '',
        isOrganization: data.is_organization || false,
        averageRating: data.average_rating || 0,
        profileImage: data.profile_image || '',
        emailVerified: true,
        active: true
      };
      
      return user;
    }
  } catch (error) {
    console.error('Error al consultar Supabase:', error);
  }
  
  // Si estamos en modo offline, buscar en caché
  if (offlineMode()) {
    const users = getUsers();
    console.log('Usuarios en modo offline:', users);
    const user = users.find(user => user.id === id);
    
    if (user) {
      console.log('Usuario encontrado en caché offline:', user);
      return user;
    }
  }
  
  console.log('No se encontró usuario con id:', id);
  return null;
};

/**
 * Get wastes by user ID
 */
export const getWastesByUserId = async (userId: string): Promise<Waste[]> => {
  try {
    console.log('getWastesByUserId llamado con userId:', userId);
    
    // Try to get wastes from Supabase first
    if (!offlineMode()) {
      try {
        const { data, error } = await supabase
          .from('wastes')
          .select('*')
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error getting wastes from Supabase:', error);
        } else if (data && data.length > 0) {
          console.log('Wastes found in Supabase:', data);
          // Transform the Supabase waste data to our application's format
          return data.map(waste => transformSupabaseWaste(waste));
        }
      } catch (supabaseError) {
        console.error('Error querying Supabase for wastes:', supabaseError);
      }
    }
    
    // Fallback to local wastes
    const allWastes = await getWastes();
    console.log('Todos los residuos (local):', allWastes);
    const filteredWastes = allWastes.filter(waste => waste.userId === userId);
    console.log('Residuos filtrados (local):', filteredWastes);
    return filteredWastes;
  } catch (error) {
    console.error(`Error al obtener residuos para el usuario ${userId}:`, error);
    return [];
  }
};

/**
 * Save user to Supabase
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    console.log('Guardando usuario en Supabase:', user);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        is_organization: user.isOrganization,
        average_rating: user.averageRating,
        profile_image: user.profileImage
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('Error guardando usuario en Supabase:', error);
    } else {
      console.log('Usuario guardado en Supabase exitosamente');
    }
  } catch (error) {
    console.error('Error guardando usuario:', error);
  }
};

/**
 * Delete user by ID (desactivar)
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    console.log('Desactivando usuario en Supabase:', id);
    
    // Actualizar el nombre para marcar como eliminado en lugar de usar un flag "active"
    const { error } = await supabase
      .from('profiles')
      .update({ 
        name: 'DELETED_USER',
        profile_image: null
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error desactivando usuario en Supabase:', error);
    } else {
      console.log('Usuario desactivado en Supabase exitosamente');
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error);
  }
};
