
import { User, Waste } from "@/types";
import { USERS_STORAGE_KEY, initialUsers } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";
import { getWastes } from "../wastes";
import { getOfflineProfiles } from "@/utils/supabaseConnectionUtils";
import { offlineMode } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { safeTableAccess } from "@/utils/supabaseMockUtils";

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
        active: profile.active
      }));
    }
  }
  
  // Si no estamos en modo offline o no hay perfiles en caché, usamos el almacenamiento local normal
  return getFromStorage<User[]>(USERS_STORAGE_KEY, initialUsers);
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
  
  // Primero verificar en localStorage si estamos en modo offline
  if (offlineMode()) {
    const users = getUsers();
    console.log('Usuarios en modo offline:', users);
    const user = users.find(user => user.id === id);
    
    if (user) {
      console.log('Usuario encontrado en caché offline:', user);
      return user;
    }
  } else {
    // Si estamos online, intentar obtener de Supabase
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
  }
  
  // Segundo, buscar en los usuarios locales
  const users = getUsers();
  console.log('Todos los usuarios en localStorage:', users);
  const user = users.find(user => user.id === id);
  
  if (user) {
    console.log('Usuario encontrado en localStorage:', user);
    return user;
  }
  
  // Si el usuario no se encuentra pero tenemos el ID actual en localStorage
  const authUserData = localStorage.getItem('auth_user_data');
  if (authUserData) {
    try {
      const authUser = JSON.parse(authUserData);
      if (authUser && authUser.id === id) {
        console.log('Usuario encontrado en auth_user_data:', authUser);
        return authUser;
      }
    } catch (error) {
      console.error('Error al analizar auth_user_data:', error);
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
    const allWastes = await getWastes();
    console.log('Todos los residuos:', allWastes);
    const filteredWastes = allWastes.filter(waste => waste.userId === userId);
    console.log('Residuos filtrados:', filteredWastes);
    return filteredWastes;
  } catch (error) {
    console.error(`Error al obtener residuos para el usuario ${userId}:`, error);
    return [];
  }
};

/**
 * Save user to localStorage
 */
export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage(USERS_STORAGE_KEY, users);
};

/**
 * Delete user by ID
 */
export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  saveToStorage(USERS_STORAGE_KEY, filteredUsers);
};
