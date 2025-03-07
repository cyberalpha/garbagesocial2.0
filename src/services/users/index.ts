
/**
 * User data service functions
 */
import { User } from "@/types";
import { USERS_STORAGE_KEY, initialUsers } from "./constants";
import { saveToStorage, getFromStorage } from "../localStorage";

// Get initial users from localStorage or default to initial data
let localUsers = getFromStorage<User[]>(USERS_STORAGE_KEY, [...initialUsers]);

// Save users to localStorage
const saveUsersToStorage = () => {
  saveToStorage(USERS_STORAGE_KEY, localUsers);
};

// Get all users
export const getAllUsers = (): User[] => {
  return localUsers;
};

// Get all active users
export const getAllActiveUsers = (): User[] => {
  return localUsers.filter(user => user.active !== false);
};

// Get user by id
export const getUserById = (id: string): User | undefined => {
  console.log('Looking for user with ID:', id);
  console.log('Available users:', localUsers);
  const user = localUsers.find(user => user.id === id);
  console.log('Found user:', user);
  return user;
};

// Get active user by id
export const getActiveUserById = (id: string): User | undefined => {
  return localUsers.find(user => user.id === id && user.active !== false);
};

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return localUsers.find(user => user.email === email);
};

// Get active user by email
export const getActiveUserByEmail = (email: string): User | undefined => {
  return localUsers.find(user => user.email === email && user.active !== false);
};

// Add a new user
export const addUser = (user: User): User => {
  console.log('Adding user:', user);
  
  // Check if user with the same email exists but is deactivated
  const existingUserIndex = localUsers.findIndex(u => u.email === user.email);
  
  if (existingUserIndex !== -1 && localUsers[existingUserIndex].active === false) {
    // Reactivate and update existing user
    localUsers[existingUserIndex] = { 
      ...localUsers[existingUserIndex], 
      ...user, 
      active: true 
    };
    console.log('Reactivated user:', localUsers[existingUserIndex]);
    saveUsersToStorage(); // Save to localStorage
    return localUsers[existingUserIndex];
  }
  
  // Add as new user with active status
  const newUser = { ...user, active: true };
  localUsers.push(newUser);
  console.log('Added new user:', newUser);
  console.log('Updated users list:', localUsers);
  saveUsersToStorage(); // Save to localStorage
  return newUser;
};

// Update a user
export const updateUser = (userId: string, userData: Partial<User>): User | null => {
  const index = localUsers.findIndex(user => user.id === userId);
  if (index === -1) return null;
  
  localUsers[index] = { ...localUsers[index], ...userData };
  saveUsersToStorage(); // Save to localStorage
  return localUsers[index];
};

// Deactivate a user (soft delete)
export const deleteUser = (userId: string): boolean => {
  const index = localUsers.findIndex(user => user.id === userId);
  
  if (index === -1) return false;
  
  // Mark user as inactive instead of removing
  localUsers[index] = { ...localUsers[index], active: false };
  saveUsersToStorage(); // Save to localStorage
  return true;
};
