
import { User, Waste } from "@/types";
import { USERS_STORAGE_KEY, initialUsers } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";
import { getWastes } from "../wastes";

/**
 * Get all users from localStorage
 */
export const getUsers = (): User[] => {
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
