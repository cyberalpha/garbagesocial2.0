
import { User, Waste } from "@/types";
import { USERS_STORAGE_KEY, initialUsers } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";
import { getWastes } from "../wastes";
import { getOfflineProfiles } from "@/utils/supabaseConnectionUtils";
import { offlineMode } from "@/integrations/supabase/client";

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
export const getUserById = (id: string): User | null => {
  console.log('getUserById called with id:', id);
  const users = getUsers();
  console.log('All users:', users);
  
  // Primero buscar en los usuarios obtenidos
  const user = users.find(user => user.id === id);
  
  if (user) {
    console.log('User found in users array:', user);
    return user;
  }
  
  // Si el usuario no se encuentra pero tenemos el ID actual en localStorage
  const authUserData = localStorage.getItem('auth_user_data');
  if (authUserData) {
    try {
      const authUser = JSON.parse(authUserData);
      if (authUser && authUser.id === id) {
        console.log('User found in auth_user_data:', authUser);
        return authUser;
      }
    } catch (error) {
      console.error('Error parsing auth_user_data:', error);
    }
  }
  
  console.log('No user found with id:', id);
  return null;
};

/**
 * Get wastes by user ID
 */
export const getWastesByUserId = async (userId: string): Promise<Waste[]> => {
  try {
    console.log('getWastesByUserId called with userId:', userId);
    const allWastes = await getWastes();
    console.log('All wastes:', allWastes);
    const filteredWastes = allWastes.filter(waste => waste.userId === userId);
    console.log('Filtered wastes:', filteredWastes);
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
