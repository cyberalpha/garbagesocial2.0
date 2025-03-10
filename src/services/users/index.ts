
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
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

/**
 * Get wastes by user ID
 */
export const getWastesByUserId = async (userId: string): Promise<Waste[]> => {
  try {
    const allWastes = await getWastes();
    return allWastes.filter(waste => waste.userId === userId);
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
